"use strict";

/*

  ==========================================

  QAIWAN AZAN

  Main Application

  ==========================================

*/

/* -----------------------------

   PRAYER DATA

----------------------------- */

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

let prayerTimes = {};

let countdownInterval = null;

let dhikrCount = 0;

let currentAudioSurah = "یاسین";

/* -----------------------------

   DEFAULT PRAYER TIMES

----------------------------- */

const defaultPrayerTimes = {

  Imsak: "04:16",

  Fajr: "04:36",

  Dhuhr: "12:27",

  Asr: "15:59",

  Maghrib: "18:35",

  Isha: "19:53"

};

/* -----------------------------

   DOM

----------------------------- */

const $ = selector =>

  document.querySelector(selector);

const $$ = selector =>

  document.querySelectorAll(selector);

/* -----------------------------

   SCREEN NAVIGATION

----------------------------- */

function showScreen(screenId){

  $$(".screen").forEach(screen => {

    screen.classList.remove("active");

  });

  const screen =

    document.getElementById(screenId);

  if(screen){

    screen.classList.add("active");

  }

  $$(".nav-btn").forEach(button => {

    button.classList.remove("active");

    if(

      button.dataset.screen === screenId

    ){

      button.classList.add("active");

    }

  });

  window.scrollTo({

    top:0,

    behavior:"smooth"

  });

}

/* -----------------------------

   NAV BUTTONS

----------------------------- */

$$(".nav-btn").forEach(button => {

  button.addEventListener(

    "click",

    () => {

      showScreen(

        button.dataset.screen

      );

    }

  );

});

$$("[data-go]").forEach(button => {

  button.addEventListener(

    "click",

    () => {

      showScreen(

        button.dataset.go

      );

    }

  );

});

/* -----------------------------

   TOAST

----------------------------- */

function showToast(message){

  const toast =

    $("#toast");

  if(!toast) return;

  toast.textContent =

    message;

  toast.classList.add("show");

  clearTimeout(

    toast._timer

  );

  toast._timer =

    setTimeout(() => {

      toast.classList.remove(

        "show"

      );

    },2200);

}

/* -----------------------------

   PRAYER API

----------------------------- */

async function fetchPrayerTimes(

  latitude,

  longitude

){

  try{

    const now =

      new Date();

    const day =

      String(

        now.getDate()

      ).padStart(2,"0");

    const month =

      String(

        now.getMonth()+1

      ).padStart(2,"0");

    const year =

      now.getFullYear();

    const url =

      "https://api.aladhan.com/v1/timings/" +

      `${day}-${month}-${year}` +

      `?latitude=${latitude}` +

      `&longitude=${longitude}` +

      "&method=3";

    const response =

      await fetch(url);

    if(!response.ok){

      throw new Error(

        "Prayer API failed"

      );

    }

    const data =

      await response.json();

    if(

      !data.data ||

      !data.data.timings

    ){

      throw new Error(

        "No prayer data"

      );

    }

    prayerTimes =

      data.data.timings;

    updatePrayerUI();

    updateLocation(

      latitude,

      longitude

    );

    showToast(

      "کاتی نوێژ نوێ کرایەوە"

    );

  }catch(error){

    console.error(error);

    prayerTimes = {

      ...defaultPrayerTimes

    };

    updatePrayerUI();

    showToast(

      "کاتی نموونەیی بەکارهێنرا"

    );

  }

}

/* -----------------------------

   LOCATION

----------------------------- */

function getLocation(){

  if(

    !navigator.geolocation

  ){

    prayerTimes = {

      ...defaultPrayerTimes

    };

    updatePrayerUI();

    showToast(

      "GPS پشتگیری ناکرێت"

    );

    return;

  }

  showToast(

    "شوێنی تۆ دەدۆزرێتەوە..."

  );

  navigator.geolocation.getCurrentPosition(

    position => {

      fetchPrayerTimes(

        position.coords.latitude,

        position.coords.longitude

      );

    },

    error => {

      console.warn(

        "GPS:",

        error.message

      );

      prayerTimes = {

        ...defaultPrayerTimes

      };

      updatePrayerUI();

      showToast(

        "GPS ڕێگەپێدانی نەدرا"

      );

    },

    {

      enableHighAccuracy:true,

      timeout:15000,

      maximumAge:300000

    }

  );

}

/* -----------------------------

   LOCATION UI

----------------------------- */

function updateLocation(

  latitude,

  longitude

){

  const value =

    `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

  const home =

    $("#locationText");

  const settings =

    $("#settingsLocation");

  if(home){

    home.textContent =

      value;

  }

  if(settings){

    settings.textContent =

      value;

  }

}

/* -----------------------------

   CLEAN TIME

----------------------------- */

function cleanTime(time){

  if(!time){

    return "--:--";

  }

  return String(time)

    .replace(/\s*\(.+?\)/g,"")

    .slice(0,5);

}

/* -----------------------------

   UPDATE PRAYER UI

----------------------------- */

function updatePrayerUI(){

  const times = {

    Imsak:

      cleanTime(prayerTimes.Imsak),

    Fajr:

      cleanTime(prayerTimes.Fajr),

    Dhuhr:

      cleanTime(prayerTimes.Dhuhr),

    Asr:

      cleanTime(prayerTimes.Asr),

    Maghrib:

      cleanTime(prayerTimes.Maghrib),

    Isha:

      cleanTime(prayerTimes.Isha)

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

  /* PRAYERS */

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

/* -----------------------------

   TIME CONVERSION

----------------------------- */

function createDateFromTime(

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

      date.getDate()+1

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

/* -----------------------------

   FIND NEXT PRAYER

----------------------------- */

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

      createDateFromTime(time);

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

  const fajr =

    cleanTime(

      prayerTimes.Fajr

    );

  const tomorrowFajr =

    createDateFromTime(

      fajr,

      true

    );

  setNextPrayer(

    "Fajr",

    fajr,

    tomorrowFajr

  );

}

/* -----------------------------

   SET NEXT PRAYER

----------------------------- */

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

  highlightPrayer(key);

  startCountdown(date);

}

/* -----------------------------

   HIGHLIGHT

----------------------------- */

function highlightPrayer(key){

  $$(".prayer").forEach(

    item => {

      item.classList.remove(

        "active"

      );

      if(

        item.dataset.prayer === key

      ){

        item.classList.add(

          "active"

        );

      }

    }

  );

}

/* -----------------------------

   COUNTDOWN

----------------------------- */

function startCountdown(

  target

){

  clearInterval(

    countdownInterval

  );

  function update(){

    const now =

      new Date();

    let difference =

      target.getTime() -

      now.getTime();

    if(difference <= 0){

      clearInterval(

        countdownInterval

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

        [

          hours,

          minutes,

          seconds

        ]

        .map(

          number =>

            String(number).padStart(2,"0")

        )

        .join(":");

    }

  }

  update();

  countdownInterval =

    setInterval(

      update,

      1000

    );

}

/* -----------------------------

   QURAN SEARCH

----------------------------- */

const quranSearch =

  $("#quranSearch");

if(quranSearch){

  quranSearch.addEventListener(

    "input",

    () => {

      const value =

        quranSearch.value

          .trim()

          .toLowerCase();

      $$(".surah").forEach(

        surah => {

          const name =

            (

              surah.dataset.name || ""

            )

            .toLowerCase();

          surah.style.display =

            name.includes(value)

              ? "flex"

              : "none";

        }

      );

    }

  );

}

/* -----------------------------

   QURAN AUDIO

----------------------------- */

const quranAudio =

  $("#quranAudio");

function openQuranAudio(

  surah

){

  currentAudioSurah =

    surah;

  if($("#audioSurah")){

    $("#audioSurah").textContent =

      `سورەتی ${surah}`;

  }

  showScreen("audio");

  showToast(

    `سورەتی ${surah} هەڵبژێردرا`

  );

}

/*

  ئەم بەشە تەنها نموونەی URL ـی audio ـە.

  دەتوانین لە قۆناغی دواتر audio source ـی

  هەموو 114 سورەت بە API/CDN ـی تایبەت زیاد بکەین.

*/

const audioSources = {

  "فاتحە":

    "",

  "بەقەرە":

    "",

  "عیمڕان":

    "",

  "نیسا":

    "",

  "مائدە":

    "",

  "یاسین":

    ""

};

$$(".surah-play").forEach(

  button => {

    button.addEventListener(

      "click",

      () => {

        openQuranAudio(

          button.dataset.surah

        );

      }

    );

  }

);

if($("#lastReadBtn")){

  $("#lastReadBtn")

    .addEventListener(

      "click",

      () => {

        openQuranAudio(

          "یاسین"

        );

      }

    );

}

/* -----------------------------

   AUDIO PLAY

----------------------------- */

if($("#audioPlay")){

  $("#audioPlay")

    .addEventListener(

      "click",

      () => {

        if(

          !quranAudio ||

          !quranAudio.src

        ){

          showToast(

            "سەرچاوەی تلاوەت هێشتا زیاد نەکراوە"

          );

          return;

        }

        if(

          quranAudio.paused

        ){

          quranAudio.play();

          $("#audioPlay")

            .textContent =

              "Ⅱ";

        }else{

          quranAudio.pause();

          $("#audioPlay")

            .textContent =

              "▶";

        }

      }

    );

}

/* -----------------------------

   SWITCHES

----------------------------- */

$$("[data-switch]").forEach(

  button => {

    button.addEventListener(

      "click",

      () => {

        button.classList.toggle(

          "active"

        );

        const active =

          button.classList.contains(

            "active"

          );

        showToast(

          active

            ? "چالاک کرا"

            : "ناچالاک کرا"

        );

      }

    );

  }

);

/* -----------------------------

   DHIKR

----------------------------- */

if($("#counterBtn")){

  $("#counterBtn")

    .addEventListener(

      "click",

      () => {

        dhikrCount++;

        if($("#dhikrNumber")){

          $("#dhikrNumber")

            .textContent =

              dhikrCount;

        }

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

      () => {

        dhikrCount = 0;

        $("#dhikrNumber")

          .textContent =

            "0";

      }

    );

}

/* -----------------------------

   COMPASS

----------------------------- */

function startCompass(){

  if(

    !window.DeviceOrientationEvent

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

      .then(permission => {

        if(

          permission === "granted"

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

            "ڕێگەپێدان بە Compass نەدرا"

          );

        }

      })

      .catch(error => {

        console.error(error);

        showToast(

          "Compass چالاک نەکرا"

        );

      });

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

  if(!needle) return;

  const alpha =

    event.alpha || 0;

  needle.style.transform =

    `translateX(-50%) rotate(${alpha + 35}deg)`;

}

if($("#compassBtn")){

  $("#compassBtn")

    .addEventListener(

      "click",

      startCompass

    );

}

/* -----------------------------

   MODAL

----------------------------- */

const modal =

  $("#modal");

const modalTitle =

  $("#modalTitle");

const modalContent =

  $("#modalContent");

function openModal(type){

  if(!modal) return;

  modal.classList.add(

    "show"

  );

  if(type === "notifications"){

    modalTitle.textContent =

      "ئاگادارکردنەوە";

    modalContent.innerHTML = `

      <button class="modal-option">

        🕌 کاتی نوێژی داهاتوو

      </button>

      <button class="modal-option">

        📖 بەردەوام بە لە قورئان

      </button>

      <button class="modal-option">

        🤲 ئەذکاری ئێوارە

      </button>

    `;

  }

  if(type === "menu"){

    modalTitle.textContent =

      "Qaiwan Azan";

    modalContent.innerHTML = `

      <button class="modal-option" data-modal-go="prayers">

        🕌 کاتی نوێژ

      </button>

      <button class="modal-option" data-modal-go="quran">

        📖 قورئان

      </button>

      <button class="modal-option" data-modal-go="qibla">

        🧭 قیبلە

      </button>

      <button class="modal-option" data-modal-go="adhkar">

        🤲 ئەذکار

      </button>

      <button class="modal-option" data-modal-go="settings">

        ⚙ ڕێکخستن

      </button>

    `;

    $$("[data-modal-go]")

      .forEach(button => {

        button.addEventListener(

          "click",

          () => {

            showScreen(

              button.dataset.modalGo

            );

            closeModal();

          }

        );

      });

  }

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

    event => {

      if(

        event.target === modal

      ){

        closeModal();

      }

    }

  );

}

/* -----------------------------

   HEADER BUTTONS

----------------------------- */

if($("#notificationBtn")){

  $("#notificationBtn")

    .addEventListener(

      "click",

      () => {

        openModal(

          "notifications"

        );

      }

    );

}

if($("#menuBtn")){

  $("#menuBtn")

    .addEventListener(

      "click",

      () => {

        openModal(

          "menu"

        );

      }

    );

}

/* -----------------------------

   SAVE SETTINGS

----------------------------- */

function saveSwitches(){

  const states =

    [...$$("[data-switch]")]

      .map(

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

  if(!saved) return;

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

          }

        }

      );

  }catch(error){

    console.error(error);

  }

}

$$("[data-switch]").forEach(

  button => {

    button.addEventListener(

      "click",

      saveSwitches

    );

  }

);

/* -----------------------------

   SAVE DHIKR

----------------------------- */

function saveDhikr(){

  localStorage.setItem(

    "qaiwanDhikr",

    String(dhikrCount)

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

    if($("#dhikrNumber")){

      $("#dhikrNumber")

        .textContent =

          dhikrCount;

    }

  }

}

if($("#counterBtn")){

  $("#counterBtn")

    .addEventListener(

      "click",

      saveDhikr

    );

}

if($("#resetDhikr")){

  $("#resetDhikr")

    .addEventListener(

      "click",

      saveDhikr

    );

}

/* -----------------------------

   INITIALIZE

----------------------------- */

document.addEventListener(

  "DOMContentLoaded",

  () => {

    prayerTimes = {

      ...defaultPrayerTimes

    };

    updatePrayerUI();

    loadSwitches();

    loadDhikr();

    getLocation();

    showScreen(

      "home"

    );

  }

);