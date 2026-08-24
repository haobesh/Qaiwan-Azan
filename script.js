"use strict";

document.addEventListener("DOMContentLoaded", function(){

  const $ = function(id){

    return document.getElementById(id);

  };

  const pages = document.querySelectorAll(".page");

  const navButtons = document.querySelectorAll("[data-page]");

  let currentPrayers = null;

  let nextPrayer = null;

  let dhikr = 0;

  /* =========================

     TOAST

  ========================= */

  function toast(text){

    const box = $("toast");

    box.textContent = text;

    box.classList.add("show");

    clearTimeout(window.toastTimeout);

    window.toastTimeout = setTimeout(function(){

      box.classList.remove("show");

    },2500);

  }

  /* =========================

     PAGE NAVIGATION

  ========================= */

  function openPage(name){

    pages.forEach(function(page){

      page.classList.toggle(

        "active",

        page.id === name

      );

    });

    document.querySelectorAll(".bottom button").forEach(function(btn){

      btn.classList.toggle(

        "active",

        btn.dataset.page === name

      );

    });

    closeMenu();

    window.scrollTo({

      top:0,

      behavior:"smooth"

    });

  }

  navButtons.forEach(function(button){

    button.addEventListener("click",function(){

      openPage(

        button.dataset.page

      );

    });

  });

  /* =========================

     MENU

  ========================= */

  const menu = $("menu");

  const overlay = $("overlay");

  function openMenu(){

    menu.classList.add("open");

    overlay.classList.add("show");

  }

  function closeMenu(){

    menu.classList.remove("open");

    overlay.classList.remove("show");

  }

  $("menuBtn").addEventListener(

    "click",

    openMenu

  );

  $("closeMenu").addEventListener(

    "click",

    closeMenu

  );

  overlay.addEventListener(

    "click",

    closeMenu

  );

  /* =========================

     PRAYER TIMES

  ========================= */

  async function loadPrayerTimes(){

    $("nextName").textContent = "دەخەینەوە...";

    $("timer").textContent = "--:--:--";

    try{

      const date = new Date();

      const day =

        String(date.getDate()).padStart(2,"0");

      const month =

        String(date.getMonth()+1).padStart(2,"0");

      const year =

        date.getFullYear();

      /*

        Default:

        Sulaymaniyah

        Latitude: 35.56

        Longitude: 45.44

      */

      const lat = 35.5613;

      const lon = 45.4375;

      const url =

        "https://api.aladhan.com/v1/timings/" +

        `${day}-${month}-${year}` +

        `?latitude=${lat}` +

        `&longitude=${lon}` +

        "&method=3";

      const response =

        await fetch(url);

      if(!response.ok){

        throw new Error("API error");

      }

      const json =

        await response.json();

      if(

        !json ||

        !json.data ||

        !json.data.timings

      ){

        throw new Error("Invalid data");

      }

      const t =

        json.data.timings;

      currentPrayers = {

        fajr:t.Fajr,

        dhuhr:t.Dhuhr,

        asr:t.Asr,

        maghrib:t.Maghrib,

        isha:t.Isha

      };

      $("fajr").textContent =

        currentPrayers.fajr;

      $("dhuhr").textContent =

        currentPrayers.dhuhr;

      $("asr").textContent =

        currentPrayers.asr;

      $("maghrib").textContent =

        currentPrayers.maghrib;

      $("isha").textContent =

        currentPrayers.isha;

      findNextPrayer();

    }catch(error){

      console.error(error);

      /*

        Fallback times

        so the app never remains --:--

      */

      currentPrayers = {

        fajr:"04:30",

        dhuhr:"12:15",

        asr:"15:45",

        maghrib:"18:35",

        isha:"19:55"

      };

      $("fajr").textContent =

        currentPrayers.fajr;

      $("dhuhr").textContent =

        currentPrayers.dhuhr;

      $("asr").textContent =

        currentPrayers.asr;

      $("maghrib").textContent =

        currentPrayers.maghrib;

      $("isha").textContent =

        currentPrayers.isha;

      findNextPrayer();

      toast(

        "کاتی بنەڕەتی پیشان درا"

      );

    }

  }

  function minutesFromTime(time){

    const clean =

      time.replace(

        /[^0-9:]/g,

        ""

      );

    const parts =

      clean.split(":");

    let hour =

      Number(parts[0]);

    const minute =

      Number(parts[1]);

    /*

      Handle possible 12-hour format

    */

    if(

      /pm/i.test(time) &&

      hour < 12

    ){

      hour += 12;

    }

    if(

      /am/i.test(time) &&

      hour === 12

    ){

      hour = 0;

    }

    return hour*60 + minute;

  }

  function findNextPrayer(){

    if(!currentPrayers){

      return;

    }

    const now =

      new Date();

    const nowMinutes =

      now.getHours()*60 +

      now.getMinutes();

    const list = [

      {

        key:"fajr",

        name:"بەیانی"

      },

      {

        key:"dhuhr",

        name:"نوێڕۆ"

      },

      {

        key:"asr",

        name:"عەسر"

      },

      {

        key:"maghrib",

        name:"مەغریب"

      },

      {

        key:"isha",

        name:"عیشاء"

      }

    ];

    nextPrayer = null;

    for(

      let i=0;

      i<list.length;

      i++

    ){

      const item =

        list[i];

      const minutes =

        minutesFromTime(

          currentPrayers[item.key]

        );

      if(minutes > nowMinutes){

        nextPrayer = item;

        break;

      }

    }

    /*

      If all prayers have passed,

      next prayer is tomorrow's Fajr.

    */

    if(!nextPrayer){

      nextPrayer = list[0];

      nextPrayer.tomorrow = true;

    }

    $("nextName").textContent =

      nextPrayer.name;

    $("nextTime").textContent =

      currentPrayers[

        nextPrayer.key

      ];

    document.querySelectorAll(".prayer")

      .forEach(function(card){

        card.classList.remove("active");

      });

    const ids = {

      fajr:"fajr",

      dhuhr:"dhuhr",

      asr:"asr",

      maghrib:"maghrib",

      isha:"isha"

    };

    $(ids[nextPrayer.key])

      .parentElement

      .classList.add("active");

    updateCountdown();

  }

  function updateCountdown(){

    if(

      !currentPrayers ||

      !nextPrayer

    ){

      return;

    }

    const now =

      new Date();

    const time =

      currentPrayers[

        nextPrayer.key

      ];

    const parts =

      time

        .replace(

          /[^0-9:]/g,

          ""

        )

        .split(":")

        .map(Number);

    let target =

      new Date();

    target.setHours(

      parts[0],

      parts[1],

      0,

      0

    );

    if(

      nextPrayer.tomorrow ||

      target <= now

    ){

      target.setDate(

        target.getDate()+1

      );

    }

    let seconds =

      Math.floor(

        (target-now)/1000

      );

    if(seconds < 0){

      seconds = 0;

    }

    const h =

      Math.floor(seconds/3600);

    const m =

      Math.floor(

        (seconds%3600)/60

      );

    const s =

      seconds%60;

    $("timer").textContent =

      String(h).padStart(2,"0") +

      ":" +

      String(m).padStart(2,"0") +

      ":" +

      String(s).padStart(2,"0");

  }

  setInterval(

    function(){

      updateCountdown();

    },

    1000

  );

  /*

    Refresh prayer status every minute

  */

  setInterval(

    function(){

      findNextPrayer();

    },

    60000

  );

  /* =========================

     LOCATION

  ========================= */

  $("locationBtn")

    .addEventListener(

      "click",

      function(){

        if(!navigator.geolocation){

          toast(

            "GPS لەم ئامێرەدا بەردەست نییە"

          );

          return;

        }

        toast(

          "لە دۆزینەوەی شوێنەکەتدایین..."

        );

        navigator.geolocation.getCurrentPosition(

          function(position){

            const lat =

              position.coords.latitude;

            const lon =

              position.coords.longitude;

            $("locationName")

              .textContent =

              lat.toFixed(4) +

              "°, " +

              lon.toFixed(4) +

              "°";

            $("locationStatus")

              .textContent =

              "شوێنی GPS";

            /*

              For the next version we can

              send these coordinates to

              the prayer API.

            */

            toast(

              "شوێن بە سەرکەوتوویی دۆزرایەوە"

            );

          },

          function(){

            toast(

              "ڕێگە بە GPS نەدرا"

            );

          },

          {

            enableHighAccuracy:true,

            timeout:15000,

            maximumAge:300000

          }

        );

      }

    );

  /* =========================

     DAILY AYAH

  ========================= */

  const ayahs = [

    {

      text:"إِنَّ مَعَ الْعُسْرِ يُسْرًا",

      ref:"الشرح • 6"

    },

    {

      text:"وَقُل رَّبِّ زِدْنِي عِلْمًا",

      ref:"طه • 114"

    },

    {

      text:"فَاذْكُرُونِي أَذْكُرْكُمْ",

      ref:"البقرة • 152"

    },

    {

      text:"إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",

      ref:"البقرة • 153"

    }

  ];

  let ayahIndex = 0;

  $("newAyah")

    .addEventListener(

      "click",

      function(){

        ayahIndex++;

        if(

          ayahIndex >= ayahs.length

        ){

          ayahIndex = 0;

        }

        $("ayah").textContent =

          ayahs[ayahIndex].text;

        $("ayahRef").textContent =

          ayahs[ayahIndex].ref;

      }

    );

  /* =========================

     DHIKR

  ========================= */

  $("dhikrBtn")

    .addEventListener(

      "click",

      function(){

        dhikr++;

        $("dhikrCount")

          .textContent =

          dhikr;

        if(dhikr === 33){

          toast(

            "٣٣ جار تەواو بوو"

          );

        }

      }

    );

  $("resetDhikr")

    .addEventListener(

      "click",

      function(){

        dhikr = 0;

        $("dhikrCount")

          .textContent = "0";

      }

    );

  /* =========================

     QIBLA

  ========================= */

  let qiblaDegree = 0;

  function calculateQibla(

    latitude,

    longitude

  ){

    const kaabaLat =

      21.4225;

    const kaabaLon =

      39.8262;

    const toRad =

      Math.PI / 180;

    const lat1 =

      latitude * toRad;

    const lat2 =

      kaabaLat * toRad;

    const deltaLon =

      (kaabaLon-longitude) *

      toRad;

    const y =

      Math.sin(deltaLon) *

      Math.cos(lat2);

    const x =

      Math.cos(lat1) *

      Math.sin(lat2) -

      Math.sin(lat1) *

      Math.cos(lat2) *

      Math.cos(deltaLon);

    qiblaDegree =

      (

        Math.atan2(y,x) /

        toRad +

        360

      ) % 360;

    $("qiblaDegree")

      .textContent =

      "قیبلە: " +

      qiblaDegree.toFixed(1) +

      "°";

  }

  calculateQibla(

    35.5613,

    45.4375

  );

  $("qiblaBtn")

    .addEventListener(

      "click",

      async function(){

        calculateQibla(

          35.5613,

          45.4375

        );

        if(

          typeof DeviceOrientationEvent !==

          "undefined" &&

          typeof DeviceOrientationEvent

            .requestPermission ===

          "function"

        ){

          try{

            const permission =

              await DeviceOrientationEvent

                .requestPermission();

            if(

              permission !== "granted"

            ){

              $("qiblaText")

                .textContent =

                "ڕێگە بە compass نەدرا.";

              return;

            }

          }catch(error){

            console.log(error);

          }

        }

        window.addEventListener(

          "deviceorientation",

          function(event){

            let heading = null;

            if(

              typeof event.webkitCompassHeading ===

              "number"

            ){

              heading =

                event.webkitCompassHeading;

            }

            else if(

              typeof event.alpha ===

              "number"

            ){

              heading =

                360-event.alpha;

            }

            if(heading === null){

              return;

            }

            const rotation =

              qiblaDegree-heading;

            $("arrow")

              .style.transform =

              "rotate(" +

              rotation +

              "deg)";

          },

          true

        );

        $("qiblaText")

          .textContent =

          "قیبلە چالاکە.";

        toast(

          "قیبلە چالاک کرا"

        );

      }

    );

  /* =========================

     NOTIFICATION

  ========================= */

  $("notifyBtn")

    .addEventListener(

      "click",

      async function(){

        if(

          !("Notification" in window)

        ){

          toast(

            "ئاگادارکردنەوە بەردەست نییە"

          );

          return;

        }

        const permission =

          await Notification.requestPermission();

        if(

          permission === "granted"

        ){

          toast(

            "ئاگادارکردنەوە چالاک کرا"

          );

        }else{

          toast(

            "ڕێگەدان نەدرا"

          );

        }

      }

    );

  /* =========================

     SETTINGS

  ========================= */

  const notificationToggle =

    $("notifications");

  notificationToggle.checked =

    localStorage.getItem(

      "qaiwan_notifications"

    ) === "1";

  notificationToggle.addEventListener(

    "change",

    function(){

      localStorage.setItem(

        "qaiwan_notifications",

        this.checked ? "1" : "0"

      );

    }

  );

  $("clearBtn")

    .addEventListener(

      "click",

      function(){

        localStorage.clear();

        dhikr = 0;

        $("dhikrCount")

          .textContent = "0";

        notificationToggle.checked =

          false;

        toast(

          "داتا سڕایەوە"

        );

      }

    );

  /* =========================

     START

  ========================= */

  loadPrayerTimes();

});