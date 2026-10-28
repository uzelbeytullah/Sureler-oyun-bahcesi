/* GitHub Pages sürümü: ana ekrana eklenebilir uygulama ve çevrimdışı çalışma */
(function(){try{var l=document.createElement("link");l.rel="manifest";l.href="manifest.json";document.head.appendChild(l);
var m=document.createElement("meta");m.name="theme-color";m.content="#1D4AA0";document.head.appendChild(m);
if("serviceWorker" in navigator&&location.protocol==="https:")window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});}catch(e){}})();
