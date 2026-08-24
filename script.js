"use strict";

/*

=========================================

QAIWAN AZAN

=========================================

*/

/* ================================

   DEFAULT PRAYER TIMES

================================ */

const DEFAULT_TIMES = {

  Imsak: "04:16",

  Fajr: "04:36",

  Dhuhr: "12:27",

  Asr: "15:59",

  Maghrib: "18:35",

  Isha: "19:53"

};

let prayerTimes = {

  ...DEFAULT_TIMES

};

const prayerNames = {

  Fajr: "بەیانی",

  Dhuhr: "زوهر",

  Asr: "عەسر",

  Maghrib: "مەغریب",

  Isha: "عیشاء"

};

const prayerKeys = [

  "Fajr",

  "Dhuhr",

  "Asr",

  "Maghrib",

  "Isha"

];

let countdownTimer = null;

let dhikrCount = 0;

/* ================================

   HELPERS

================================ */

function $(selector){

  return document.querySelector(selector);

}

function $$(selector){

  return document.querySelectorAll(selector);

}

/* ================================

   SCREEN NAVIGATION

================================ */

function showScreen(screenId){

  $$(".screen").forEach(

    screen => {

      screen.classList.remove(

        "active"

      );

    }

  );

  const target =

    document.getElementById(

      screenId

    );

  if(!target){

    return;

  }

  target.classList.add(

    "active"

  );

  $$(".nav-btn").forEach(

    button => {

      button.classList.remove(

        "active"

      );

      if(

        button.dataset.screen ===

        screenId

      ){

        button.classList.add(

          "active"

        );

      }

    }

  );

  window.scrollTo({

    top:0,

    behavior:"smooth"

  });

}

/* ================================

   NAV BUTTONS

================================ */

$$(".nav-btn").forEach(

  button => {

    button.addEventListener(

      "click",

      function(){

        showScreen(

          this.dataset.screen

        );

      }

    );

  }

);

$$("[data-go]").forEach(

  button => {

    button.addEventListener(

      "click",

      function(){

        showScreen(

          this.dataset.go

        );

      }

    );

  }

);

/* ================================

   TOAST

================================ */

function showToast(message){

  const toast =

    $("#toast");

  if(!toast){

    return;

  }

  toast.textContent =

    message;

  toast.classList.add(

    "show"

  );

  clearTimeout(

    toast.toastTimer

  );

  toast.toastTimer =

    setTimeout(

      function(){

        toast.classList.remove(

          "show"

        );

      },

      2200

    );

}

/* ================================

   CLEAN TIME

================================ */

function cleanTime(value){

  if(!value){

    return "--:--";

  }

  return String(value)

    .replace(

      /\s*\(.+?\)/g,

      ""

    )

    .trim()

    .substring(

      0,

      5

    );

}

/* ================================

   UPDATE ALL PRAYER TIMES

================================ */

function updatePrayerUI(){

  const times = {

    Imsak:

      cleanTime(

        prayerTimes.Imsak

      ),

    Fajr:

      cleanTime(

        prayerTimes.Fajr

      ),

    Dhuhr:

      cleanTime(

        prayerTimes.Dhuhr

      ),

    Asr:

      cleanTime(

        prayerTimes.Asr

      ),

    Maghrib:

      cleanTime(

        prayerTimes.Maghrib

      ),

    Isha:

      cleanTime(

        prayerTimes.Isha

      )

  };

  /* HOME */

  if($("#homeFajr"))

    $("#homeFajr").textContent =

      times.Fajr;

  if($("#homeDhuhr"))

    $("#homeDhuhr").textContent =

      times.Dhuhr;

  if($("#homeAsr"))

    $("#homeAsr").textContent =

      times.Asr;

  if($("#homeMaghrib"))

    $("#homeMaghrib").textContent =

      times.Maghrib;

  if($("#homeIsha"))

    $("#homeIsha").textContent =

      times.Isha;

  /* PRAYERS PAGE */

  if($("#imsakTime"))

    $("#imsakTime").textContent =

      times.Imsak;

  if($("#fajrTime"))

    $("#fajrTime").textContent =

      times.Fajr;

  if($("#dhuhrTime"))

    $("#dhuhrTime").textContent =

      times.Dhuhr;

  if($("#asrTime"))

    $("#asrTime").textContent =

      times.Asr;

  if($("#maghribTime"))

    $("#maghribTime").textContent =

      times.Maghrib;

  if($("#ishaTime"))

    $("#ishaTime").textContent =

      times.Isha;

  findNextPrayer();

}

/* ================================

   TIME TO DATE

================================ */

function timeToDate(

  time,

  tomorrow = false

){

  if(

    !time ||

    time === "--:--"

  ){

    return null;

  }

  const parts =

    time.split(":");

  if(parts.length < 2){

    return null;

  }

  const date =

    new Date();

  if(tomorrow){

    date.setDate(

      date.getDate() + 1

    );

  }

  date.setHours(

    Number(parts[0]),

    Number(parts[1]),

    0,

    0

  );

  return date;

}

/* ================================

   FIND NEXT PRAYER

================================ */

function findNextPrayer(){

  const now =

    new Date();

  for(

    const key of prayerKeys

  ){

    const time =

      cleanTime(

        prayerTimes[key]

      );

    const date =

      timeToDate(time);

    if(

      date &&

      date > now

    ){

      setNextPrayer(

        key,

        time,

        date

      );

      return;

    }

  }

  const tomorrowFajr =

    timeToDate(

      prayerTimes.Fajr,

      true

    );

  setNextPrayer(

    "Fajr",

    cleanTime(

      prayerTimes.Fajr

    ),

    tomorrowFajr

  );

}

/* ================================

   SET NEXT PRAYER

================================ */

function setNextPrayer(

  key,

  time,

  date

){

  if($("#nextPrayer")){

    $("#nextPrayer").textContent =

      prayerNames[key];

  }

  if($("#nextTime")){

    $("#nextTime").textContent =

      `کاتی نوێژ: ${time}`;

  }

  $$(".prayer").forEach(

    prayer => {

      prayer.classList.remove(

        "active"

      );

      if(

        prayer.dataset.prayer ===

        key

      ){

        prayer.classList.add(

          "active"

        );

      }

    }

  );

  startCountdown(date);

}

/* ================================

   COUNTDOWN

================================ */

function startCountdown(target){

  clearInterval(

    countdownTimer

  );

  function update(){

    const now =

      new Date();

    let difference =

      target.getTime() -

      now.getTime();

    if(

      difference <= 0

    ){

      clearInterval(

        countdownTimer

      );

      findNextPrayer();

      return;

    }

    const totalSeconds =

      Math.floor(

        difference / 1000

      );

    const hours =

      Math.floor(

        totalSeconds / 3600

      );

    const minutes =

      Math.floor(

        (totalSeconds % 3600) / 60

      );

    const seconds =

      totalSeconds % 60;

    if($("#countdown")){

      $("#countdown").textContent =

        String(hours).padStart(2,"0")

        + ":"

        + String(minutes).padStart(2,"0")

        + ":"

        + String(seconds).padStart(2,"0");

    }

  }

  update();

  countdownTimer =

    setInterval(

      update,

      1000

    );

}

/* ================================

   GPS

================================ */

function getLocation(){

  if(

    !navigator.geolocation

  ){

    useDefaultTimes();

    return;

  }

  navigator.geolocation.getCurrentPosition(

    function(position){

      const latitude =

        position.coords.latitude;

      const longitude =

        position.coords.longitude;

      updateLocationText(

        latitude,

        longitude

      );

      fetchPrayerTimes(

        latitude,

        longitude

      );

    },

    function(){

      useDefaultTimes();

      showToast(

        "کاتی بنەڕەتی بەکارهێنرا"

      );

    },

    {

      enableHighAccuracy:false,

      timeout:10000,

      maximumAge:600000

    }

  );

}

/* ================================

   DEFAULT TIMES

================================ */

function useDefaultTimes(){

  prayerTimes = {

    ...DEFAULT_TIMES

  };

  updatePrayerUI();

}

/* ================================

   LOCATION TEXT

================================ */

function updateLocationText(

  latitude,

  longitude

){

  const text =

    `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

  if($("#locationText")){

    $("#locationText")

      .textContent =

      text;

  }

  if($("#settingsLocation")){

    $("#settingsLocation")

      .textContent =

      text;

  }

}

/* ================================

   PRAYER API

================================ */

async function fetchPrayerTimes(

  latitude,

  longitude

){

  try{

    const date =

      new Date();

    const day =

      String(

        date.getDate()

      ).padStart(2,"0");

    const month =

      String(

        date.getMonth() + 1

      ).padStart(2,"0");

    const year =

      date.getFullYear();

    const url =

      `https://api.aladhan.com/v1/timings/${day}-${month}-${year}` +

      `?latitude=${latitude}` +

      `&longitude=${longitude}` +

      `&method=3`;

    const response =

      await fetch(url);

    if(!response.ok){

      throw new Error(

        "Prayer API error"

      );

    }

    const json =

      await response.json();

    if(

      !json.data ||

      !json.data.timings

    ){

      throw new Error(

        "Prayer data unavailable"

      );

    }

    const t =

      json.data.timings;

    prayerTimes = {

      Imsak:

        cleanTime(t.Imsak),

      Fajr:

        cleanTime(t.Fajr),

      Dhuhr:

        cleanTime(t.Dhuhr),

      Asr:

        cleanTime(t.Asr),

      Maghrib:

        cleanTime(t.Maghrib),

      Isha:

        cleanTime(t.Isha)

    };

    updatePrayerUI();

    showToast(

      "کاتی نوێژ نوێ کرایەوە"

    );

  }catch(error){

    console.error(

      error

    );

    useDefaultTimes();

  }

}

/* ================================

   QURAN SEARCH

================================ */

const quranSearch =

  $("#quranSearch");

if(quranSearch){

  quranSearch.addEventListener(

    "input",

    function(){

      const value =

        this.value

          .trim()

          .toLowerCase();

      $$(".surah").forEach(

        surah => {

          const name =

            (

              surah.dataset.name ||

              ""

            ).toLowerCase();

          surah.style.display =

            name.includes(value)

              ? "flex"

              : "none";

        }

      );

    }

  );

}

/* ================================

   QURAN SURAH BUTTONS

================================ */

$$(".surah-play").forEach(

  button => {

    button.addEventListener(

      "click",

      function(){

        const surah =

          this.dataset.surah;

        if($("#audioSurah")){

          $("#audioSurah")

            .textContent =

            `سورەتی ${surah}`;

        }

        showScreen(

          "audio"

        );

        showToast(

          `سورەتی ${surah} هەڵبژێردرا`

        );

      }

    );

  }

);

if($("#lastReadBtn")){

  $("#lastReadBtn")

    .addEventListener(

      "click",

      function(){

        if($("#audioSurah")){

          $("#audioSurah")

            .textContent =

            "سورەتی یاسین";

        }

        showScreen(

          "audio"

        );

      }

    );

}

/* ================================

   AUDIO BUTTON

================================ */

if($("#audioPlay")){

  $("#audioPlay")

    .addEventListener(

      "click",

      function(){

        const audio =

          $("#quranAudio");

        if(

          !audio ||

          !audio.src

        ){

          showToast(

            "دەنگی تلاوەت هێشتا زیاد نەکراوە"

          );

          return;

        }

        if(audio.paused){

          audio.play();

          this.textContent =

            "Ⅱ";

        }else{

          audio.pause();

          this.textContent =

            "▶";

        }

      }

    );

}

/* ================================

   SWITCHES

================================ */

$$("[data-switch]").forEach(

  button => {

    button.addEventListener(

      "click",

      function(){

        this.classList.toggle(

          "active"

        );

        saveSwitches();

        showToast(

          this.classList.contains(

            "active"

          )

            ? "چالاک کرا"

            : "ناچالاک کرا"

        );

      }

    );

  }

);

function saveSwitches(){

  const states =

    Array.from(

      $$("[data-switch]")

    ).map(

      button =>

        button.classList.contains(

          "active"

        )

    );

  localStorage.setItem(

    "qaiwanSwitches",

    JSON.stringify(states)

  );

}

function loadSwitches(){

  const saved =

    localStorage.getItem(

      "qaiwanSwitches"

    );

  if(!saved){

    return;

  }

  try{

    const states =

      JSON.parse(saved);

    $$("[data-switch]")

      .forEach(

        (button,index) => {

          if(

            states[index] === false

          ){

            button.classList.remove(

              "active"

            );

          }else{

            button.classList.add(

              "active"

            );

          }

        }

      );

  }catch(error){

    console.error(

      error

    );

  }

}

/* ================================

   DHIKR

================================ */

function updateDhikr(){

  if($("#dhikrNumber")){

    $("#dhikrNumber")

      .textContent =

      dhikrCount;

  }

  localStorage.setItem(

    "qaiwanDhikr",

    String(dhikrCount)

  );

}

if($("#counterBtn")){

  $("#counterBtn")

    .addEventListener(

      "click",

      function(){

        dhikrCount++;

        updateDhikr();

        if(

          dhikrCount === 33 ||

          dhikrCount === 100

        ){

          showToast(

            `${dhikrCount} جار تەواو بوو`

          );

        }

      }

    );

}

if($("#resetDhikr")){

  $("#resetDhikr")

    .addEventListener(

      "click",

      function(){

        dhikrCount = 0;

        updateDhikr();

      }

    );

}

function loadDhikr(){

  const saved =

    localStorage.getItem(

      "qaiwanDhikr"

    );

  if(saved){

    dhikrCount =

      Number(saved) || 0;

  }

  updateDhikr();

}

/* ================================

   COMPASS

================================ */

function startCompass(){

  if(

    typeof DeviceOrientationEvent ===

    "undefined"

  ){

    showToast(

      "Compass لەم ئامێرەدا بەردەست نییە"

    );

    return;

  }

  if(

    typeof DeviceOrientationEvent.requestPermission ===

    "function"

  ){

    DeviceOrientationEvent

      .requestPermission()

      .then(

        function(permission){

          if(

            permission ===

            "granted"

          ){

            window.addEventListener(

              "deviceorientation",

              handleCompass

            );

            showToast(

              "Compass چالاک کرا"

            );

          }else{

            showToast(

              "ڕێگەپێدان نەدرا"

            );

          }

        }

      )

      .catch(

        function(){

          showToast(

            "Compass چالاک نەکرا"

          );

        }

      );

  }else{

    window.addEventListener(

      "deviceorientation",

      handleCompass

    );

    showToast(

      "Compass چالاک کرا"

    );

  }

}

function handleCompass(event){

  const needle =

    $(".needle");

  if(!needle){

    return;

  }

  let heading =

    event.alpha || 0;

  if(

    typeof event.webkitCompassHeading ===

    "number"

  ){

    heading =

      event.webkitCompassHeading;

  }

  needle.style.transform =

    `translateX(-50%) rotate(${heading}deg)`;

}

if($("#compassBtn")){

  $("#compassBtn")

    .addEventListener(

      "click",

      startCompass

    );

}

/* ================================

   MODAL

================================ */

const modal =

  $("#modal");

function openModal(

  title,

  html

){

  if(!modal){

    return;

  }

  $("#modalTitle")

    .textContent =

    title;

  $("#modalContent")

    .innerHTML =

    html;

  modal.classList.add(

    "show"

  );

}

function closeModal(){

  if(modal){

    modal.classList.remove(

      "show"

    );

  }

}

if($("#closeModal")){

  $("#closeModal")

    .addEventListener(

      "click",

      closeModal

    );

}

if(modal){

  modal.addEventListener(

    "click",

    function(event){

      if(

        event.target ===

        modal

      ){

        closeModal();

      }

    }

  );

}

/* ================================

   NOTIFICATION

================================ */

if($("#notificationBtn")){

  $("#notificationBtn")

    .addEventListener(

      "click",

      function(){

        openModal(

          "ئاگادارکردنەوە",

          `

          <button class="modal-option" type="button">

            🕌 کاتی نوێژی داهاتوو

          </button>

          <button class="modal-option" type="button">

            📖 بەردەوام بە لە قورئان

          </button>

          <button class="modal-option" type="button">

            🤲 ئەذکاری ئەمڕۆ

          </button>

          `

        );

      }

    );

}

/* ================================

   MENU

================================ */

if($("#menuBtn")){

  $("#menuBtn")

    .addEventListener(

      "click",

      function(){

        openModal(

          "Qaiwan Azan",

          `

          <button

            class="modal-option"

            type="button"

            data-menu="prayers"

          >

            🕌 کاتی نوێژ

          </button>

          <button

            class="modal-option"

            type="button"

            data-menu="quran"

          >

            📖 قورئان

          </button>

          <button

            class="modal-option"

            type="button"

            data-menu="qibla"

          >

            🧭 قیبلە

          </button>

          <button

            class="modal-option"

            type="button"

            data-menu="adhkar"

          >

            🤲 ئەذکار

          </button>

          <button

            class="modal-option"

            type="button"

            data-menu="settings"

          >

            ⚙️ ڕێکخستن

          </button>

          `

        );

        $$("[data-menu]")

          .forEach(

            button => {

              button.addEventListener(

                "click",

                function(){

                  showScreen(

                    this.dataset.menu

                  );

                  closeModal();

                }

              );

            }

          );

      }

    );

}

/* ================================

   DUAS

================================ */

$$("[data-dua]").forEach(

  button => {

    button.addEventListener(

      "click",

      function(){

        const dua =

          this.dataset.dua;

        openModal(

          dua,

          `

          <div class="modal-option">

            سُبْحَانَ اللَّهِ

          </div>

          <div class="modal-option">

            الْحَمْدُ لِلَّهِ

          </div>

          <div class="modal-option">

            اللَّهُ أَكْبَرُ

          </div>

          `

        );

      }

    );

  }

);

/* ================================

   ABOUT

================================ */

if(

  $("[data-about]")

){

  $("[data-about]")

    .addEventListener(

      "click",

      function(){

        openModal(

          "دەربارەی Qaiwan Azan",

          `

          <div class="modal-option">

            Qaiwan Azan ئەپێکی ئەذان و قورئانە.

          </div>

          <div class="modal-option">

            کاتی نوێژ، قیبلە، قورئان و ئەذکار لە یەک شوێن.

          </div>

          `

        );

      }

    );

}

/* ================================

   SUPPORT

================================ */

if(

  $("[data-support]")

){

  $("[data-support]")

    .addEventListener(

      "click",

      function(){

        openModal(

          "پشتیوانی",

          `

          <div class="modal-option">

            بۆ پشتیوانی دەتوانیت پەیوەندیمان پێوە بکەیت.

          </div>

          `

        );

      }

    );

}

/* ================================

   START APP

================================ */

document.addEventListener(

  "DOMContentLoaded",

  function(){

    /*

      گرنگ:

      پێش GPS کاتەکانی بنەڕەتی

      دادەنێین بۆ ئەوەی هیچ کاتێک

      --:-- نەبینرێت.

    */

    useDefaultTimes();

    loadSwitches();

    loadDhikr();

    getLocation();

    showScreen(

      "home"

    );

  }

);