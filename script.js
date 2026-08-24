"use strict";

/* =========================

   BASIC HELPERS

========================= */

const $ = (selector) =>

  document.querySelector(selector);

const $$ = (selector) =>

  [...document.querySelectorAll(selector)];

function pad(number){

  return String(number).padStart(2,"0");

}

function showToast(message){

  const toast = $("#toast");

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {

    toast.classList.remove("show");

  },2500);

}

/* =========================

   APP STATE

========================= */

const app = {

  latitude:35.5613,

  longitude:45.4375,

  city:"سلێمانی",

  prayers:{},

  nextPrayer:null,

  dhikr:0,

  qibla:0

};

/* =========================

   PRAYERS

========================= */

const prayerData = [

  {

    key:"fajr",

    name:"بەیانی",

    icon:"🌙"

  },

  {

    key:"dhuhr",

    name:"نوێڕۆ",

    icon:"☀️"

  },

  {

    key:"asr",

    name:"عەسر",

    icon:"🌤️"

  },

  {

    key:"maghrib",

    name:"مەغریب",

    icon:"🌅"

  },

  {

    key:"isha",

    name:"عیشاء",

    icon:"🌙"

  }

];

function radians(degree){

  return degree * Math.PI / 180;

}

function degrees(radian){

  return radian * 180 / Math.PI;

}

function sin(degree){

  return Math.sin(radians(degree));

}

function cos(degree){

  return Math.cos(radians(degree));

}

function calculateSun(){

  const date = new Date();

  const start =

    Date.UTC(

      date.getFullYear(),

      date.getMonth(),

      date.getDate()

    );

  const base =

    Date.UTC(2000,0,1);

  const days =

    (start-base)/86400000;

  const g =

    radians(

      (357.529 + 0.98560028 * days) % 360

    );

  const q =

    (280.459 + 0.98564736 * days) % 360;

  const longitude =

    (q +

      1.915 * Math.sin(g) +

      0.020 * Math.sin(2*g)

    ) % 360;

  const obliquity =

    23.439 -

    0.00000036 * days;

  const rightAscension =

    (

      degrees(

        Math.atan2(

          cos(obliquity) *

          sin(longitude),

          cos(longitude)

        )

      ) / 15

      + 24

    ) % 24;

  const equation =

    q/15 -

    rightAscension;

  const declination =

    degrees(

      Math.asin(

        sin(obliquity) *

        sin(longitude)

      )

    );

  return {

    equation,

    declination

  };

}

function hourAngle(

  latitude,

  declination,

  angle

){

  const value =

    (

      cos(angle) -

      sin(latitude) *

      sin(declination)

    ) /

    (

      cos(latitude) *

      cos(declination)

    );

  return (

    degrees(

      Math.acos(

        Math.max(

          -1,

          Math.min(1,value)

        )

      )

    ) / 15

  );

}

function calculatePrayerTimes(){

  const sun =

    calculateSun();

  const noon =

    12 -

    sun.equation -

    app.longitude / 15;

  const sunrise =

    noon -

    hourAngle(

      app.latitude,

      sun.declination,

      .833

    );

  const sunset =

    noon +

    hourAngle(

      app.latitude,

      sun.declination,

      .833

    );

  const fajr =

    noon -

    hourAngle(

      app.latitude,

      sun.declination,

      18

    );

  const isha =

    noon +

    hourAngle(

      app.latitude,

      sun.declination,

      18

    );

  const asr =

    noon +

    hourAngle(

      app.latitude,

      sun.declination,

      45

    );

  return {

    fajr,

    dhuhr:noon,

    asr,

    maghrib:sunset,

    isha

  };

}

function formatTime(decimalHours){

  let totalMinutes =

    Math.round(decimalHours*60);

  totalMinutes =

    (

      totalMinutes % 1440 +

      1440

    ) % 1440;

  const hours =

    Math.floor(

      totalMinutes / 60

    );

  const minutes =

    totalMinutes % 60;

  return `${pad(hours)}:${pad(minutes)}`;

}

function timeToMinutes(time){

  const parts =

    time.split(":").map(Number);

  return parts[0]*60 + parts[1];

}

/* =========================

   RENDER PRAYERS

========================= */

function renderPrayerTimes(){

  const calculated =

    calculatePrayerTimes();

  app.prayers = {};

  Object.keys(calculated).forEach(key => {

    app.prayers[key] =

      formatTime(

        calculated[key]

      );

  });

  const container =

    $("#prayerList");

  container.innerHTML =

    prayerData.map(prayer => {

      return `

        <div

          class="prayer"

          data-prayer="${prayer.key}"

        >

          <div class="prayer-icon">

            ${prayer.icon}

          </div>

          <div class="prayer-name">

            ${prayer.name}

          </div>

          <div class="prayer-time">

            ${app.prayers[prayer.key]}

          </div>

        </div>

      `;

    }).join("");

  findNextPrayer();

}

/* =========================

   NEXT PRAYER

========================= */

function findNextPrayer(){

  const now =

    new Date();

  const currentMinutes =

    now.getHours()*60 +

    now.getMinutes() +

    now.getSeconds()/60;

  let next =

    prayerData.find(

      prayer =>

        timeToMinutes(

          app.prayers[prayer.key]

        ) > currentMinutes

    );

  let tomorrow = false;

  if(!next){

    next = prayerData[0];

    tomorrow = true;

  }

  app.nextPrayer = {

    ...next,

    tomorrow

  };

  $("#nextPrayerName").textContent =

    next.name;

  $("#nextPrayerTime").textContent =

    app.prayers[next.key];

  $$(".prayer").forEach(card => {

    card.classList.toggle(

      "active",

      card.dataset.prayer === next.key

    );

  });

  updateCountdown();

}

function updateCountdown(){

  if(!app.nextPrayer){

    return;

  }

  const now =

    new Date();

  const target =

    new Date();

  const time =

    app.prayers[

      app.nextPrayer.key

    ];

  const parts =

    time.split(":").map(Number);

  target.setHours(

    parts[0],

    parts[1],

    0,

    0

  );

  if(

    app.nextPrayer.tomorrow ||

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

  const hours =

    Math.floor(

      seconds/3600

    );

  const minutes =

    Math.floor(

      (seconds%3600)/60

    );

  const sec =

    seconds%60;

  $("#countdown").textContent =

    `${pad(hours)}:${pad(minutes)}:${pad(sec)}`;

}

setInterval(

  updateCountdown,

  1000

);

/* =========================

   NAVIGATION

========================= */

function openPage(page){

  $$(".page").forEach(section => {

    section.classList.toggle(

      "active",

      section.id === page

    );

  });

  $$(".bottom-nav button").forEach(button => {

    button.classList.toggle(

      "active",

      button.dataset.page === page

    );

  });

  closeMenu();

  window.scrollTo({

    top:0,

    behavior:"smooth"

  });

}

$$("[data-page]").forEach(button => {

  button.addEventListener(

    "click",

    () => {

      openPage(

        button.dataset.page

      );

    }

  );

});

/* =========================

   SIDE MENU

========================= */

function openMenu(){

  $("#sideMenu")

    .classList.add("open");

  $("#overlay")

    .classList.add("show");

}

function closeMenu(){

  $("#sideMenu")

    .classList.remove("open");

  $("#overlay")

    .classList.remove("show");

}

$("#menuButton")

  .addEventListener(

    "click",

    openMenu

  );

$("#closeMenu")

  .addEventListener(

    "click",

    closeMenu

  );

$("#overlay")

  .addEventListener(

    "click",

    closeMenu

  );

/* =========================

   LOCATION

========================= */

$("#locationButton")

  .addEventListener(

    "click",

    () => {

      if(!navigator.geolocation){

        showToast(

          "GPS لەم ئامێرەدا بەردەست نییە"

        );

        return;

      }

      showToast(

        "لە دۆزینەوەی شوێنەکەتدایین..."

      );

      navigator.geolocation.getCurrentPosition(

        position => {

          app.latitude =

            position.coords.latitude;

          app.longitude =

            position.coords.longitude;

          app.city =

            `${app.latitude.toFixed(4)}°, ${app.longitude.toFixed(4)}°`;

          $("#locationName")

            .textContent =

            app.city;

          $("#locationStatus")

            .textContent =

            "شوێنی GPS";

          renderPrayerTimes();

          calculateQibla();

          showToast(

            "شوێن بە سەرکەوتوویی نوێکرایەوە"

          );

        },

        () => {

          showToast(

            "ڕێگەدان بە GPS نەدرا"

          );

        },

        {

          enableHighAccuracy:true,

          timeout:12000,

          maximumAge:300000

        }

      );

    }

  );

/* =========================

   DAILY AYAH

========================= */

const ayahs = [

  [

    "إِنَّ مَعَ الْعُسْرِ يُسْرًا",

    "الشرح • 6"

  ],

  [

    "وَقُل رَّبِّ زِدْنِي عِلْمًا",

    "طه • 114"

  ],

  [

    "فَاذْكُرُونِي أَذْكُرْكُمْ",

    "البقرة • 152"

  ],

  [

    "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",

    "البقرة • 153"

  ]

];

let ayahIndex = 0;

$("#newAyah")

  .addEventListener(

    "click",

    () => {

      ayahIndex =

        (ayahIndex+1) %

        ayahs.length;

      $("#ayahText")

        .textContent =

        ayahs[ayahIndex][0];

      $("#ayahReference")

        .textContent =

        ayahs[ayahIndex][1];

    }

  );

/* =========================

   QIBLA

========================= */

function calculateQibla(){

  const kaabaLatitude =

    21.4225;

  const kaabaLongitude =

    39.8262;

  const y =

    sin(

      kaabaLongitude -

      app.longitude

    ) *

    cos(

      kaabaLatitude

    );

  const x =

    cos(app.latitude) *

    sin(kaabaLatitude) -

    sin(app.latitude) *

    cos(kaabaLatitude) *

    cos(

      kaabaLongitude -

      app.longitude

    );

  app.qibla =

    (

      degrees(

        Math.atan2(y,x)

      ) + 360

    ) % 360;

  $("#qiblaDegree")

    .textContent =

    `قیبلە: ${app.qibla.toFixed(1)}°`;

  $("#qiblaDescription")

    .textContent =

    `ئاراستەی قیبلە ${app.qibla.toFixed(1)}° ـە.`;

}

$("#startQibla")

  .addEventListener(

    "click",

    async () => {

      calculateQibla();

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

          if(permission !== "granted"){

            showToast(

              "ڕێگە بە سنسەری مۆبایل نەدرا"

            );

            return;

          }

        }catch(error){

          console.log(error);

        }

      }

      window.addEventListener(

        "deviceorientation",

        event => {

          let heading;

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

          else{

            return;

          }

          const rotation =

            app.qibla-heading;

          $("#compassArrow")

            .style.transform =

            `rotate(${rotation}deg)`;

        },

        true

      );

      showToast(

        "قیبلە چالاک کرا"

      );

    }

  );

/* =========================

   DHIKR

========================= */

$("#dhikrButton")

  .addEventListener(

    "click",

    () => {

      app.dhikr++;

      if(app.dhikr > 33){

        app.dhikr = 0;

      }

      $("#dhikrCounter")

        .textContent =

        app.dhikr;

      if(app.dhikr === 33){

        showToast(

          "٣٣ جار تەواو بوو"

        );

      }

    }

  );

$("#resetDhikr")

  .addEventListener(

    "click",

    () => {

      app.dhikr = 0;

      $("#dhikrCounter")

        .textContent = "0";

    }

  );

/* =========================

   NOTIFICATIONS

========================= */

$("#notificationButton")

  .addEventListener(

    "click",

    async () => {

      if(

        !("Notification" in window)

      ){

        showToast(

          "Notification بەردەست نییە"

        );

        return;

      }

      const permission =

        await Notification.requestPermission();

      if(permission === "granted"){

        showToast(

          "ئاگادارکردنەوە چالاک کرا"

        );

      }

      else{

        showToast(

          "ڕێگەدان نەدرا"

        );

      }

    }

  );

$("#notificationToggle")

  .addEventListener(

    "change",

    async event => {

      localStorage.setItem(

        "qaiwan_notification",

        event.target.checked

          ? "1"

          : "0"

      );

      if(

        event.target.checked &&

        "Notification" in window

      ){

        await Notification.requestPermission();

      }

    }

  );

/* =========================

   CLEAR DATA

========================= */

$("#clearData")

  .addEventListener(

    "click",

    () => {

      localStorage.clear();

      $("#notificationToggle")

        .checked = false;

      app.dhikr = 0;

      $("#dhikrCounter")

        .textContent = "0";

      showToast(

        "هەموو داتا سڕایەوە"

      );

    }

  );

/* =========================

   START APP

========================= */

if(

  localStorage.getItem(

    "qaiwan_notification"

  ) === "1"

){

  $("#notificationToggle")

    .checked = true;

}

renderPrayerTimes();

calculateQibla();