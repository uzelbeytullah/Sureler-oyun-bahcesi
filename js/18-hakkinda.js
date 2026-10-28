/* Sureler Oyun Bahçesi · Hakkında, Gizlilik ve Kaynaklar sayfası
   Gizlilik metni bir aydınlatma metni taslağıdır; yayımlamadan önce bir hukukçuya gösterilmesi önerilir. */
const ILETISIM_URL="https://github.com/uzelbeytullah/Sureler-oyun-bahcesi/issues";
const GUNCELLEME="28 Ekim 2026";
function hakkindaHtml(sekme){
  const gh=!!(window.claude&&claude.bulut);
  const sek=[["hakkinda","Hakkında"],["gizlilik","Gizlilik"],["kaynaklar","Kaynaklar"]];
  const ust=`<button class="geri" id="hkG">← Sureler</button>
  <div class="subtabs" role="tablist" aria-label="Bilgi sayfaları">${sek.map(([k,a])=>`<button role="tab" data-hk="${k}" class="${k===sekme?"on":""}" aria-selected="${k===sekme}">${a}</button>`).join("")}</div>`;
  if(sekme==="gizlilik")return ust+`<h2>Gizlilik</h2>
  <p style="font-size:14px">Son güncelleme: ${GUNCELLEME}</p>
  <section class="detay"><h3>Kısaca (çocuklar için)</h3><p>Adın ve oyundaki ilerlemen bu cihazda durur. Annen ya da baban isterse buluta da kaydedilir. Sesini kaydedersen o ses telefonundan hiç çıkmaz. Aile yarışmasında yazdığın adı odadaki herkes görür; istersen takma ad yaz.</p></section>
  <section class="detay"><h3>Veri sorumlusu ve iletişim</h3><p>Sureler Oyun Bahçesi'ni hazırlayan geliştirici (GitHub: uzelbeytullah). Sorularınız ve talepleriniz için: <a href="${ILETISIM_URL}" target="_blank" rel="noopener">GitHub üzerinden yazın</a>.</p></section>
  <section class="detay"><h3>Hangi veriler, neden?</h3><ul>
   <li><b>Kişi adı ve yaşı:</b> sorular ve görevler yaşa göre ayarlansın diye. Takma ad kullanabilirsiniz.</li>
   <li><b>Oyundaki ilerleme</b> (yıldızlar, ezber basamakları, puan, rozetler): ilerleme kaybolmasın diye.</li>
   <li><b>Ebeveyn şifresi:</b> yalnız karma biçiminde ve yalnız bu cihazda.</li>
   <li><b>Ses kaydı</b> ("Ben okuyayım"): yalnız cihazın belleğinde tutulur, hiçbir yere gönderilmez, sayfadan çıkınca silinir.</li>
  </ul><p>Kur'an ezber ilerlemesi dinî bir etkinliğe işaret edebildiği için özenle korunması gereken veri olarak ele alınır.</p></section>
  ${gh?`<section class="detay"><h3>Bulut kaydı (isteğe bağlı)</h3><p>Varsayılan olarak her şey yalnız bu cihazdadır. Veli, ebeveyn bölümünden izin vererek bulut kaydını açarsa kişi adları, yaşları ve ilerleme, bu tarayıcıya bağlı adsız bir hesapla <b>Google Firebase</b>'de saklanır. Bu hizmetin sunucuları yurt dışındadır (Avrupa ve ABD); veriler bu nedenle yurt dışına aktarılmış olur. Bulut açıkken kötüye kullanımı önlemek için <b>Google reCAPTCHA</b> tarayıcıdan teknik bilgiler alır.</p>
  <p>Aile yarışması ve ortak hedef de bulutu kullanır. Yarışmada yazılan ad ve verilen cevaplar odadaki oyunculara görünür; oda kapanınca silinir. Ortak hedefte yalnız katkı sayısı tutulur.</p></section>
  <section class="detay"><h3>Ne kadar süre, nasıl silinir?</h3><p>Cihazdaki veriler siz silene kadar kalır (tarayıcı verilerini temizlemek hepsini siler). Bulut kaydı, ebeveyn bölümündeki <b>"Buluttaki kaydımızı sil"</b> düğmesine basana kadar kalır; bu düğme buluttaki kişi ve ilerleme kayıtlarını, ortak hedef katkısını ve adsız hesabı siler.</p></section>`:
  `<section class="detay"><h3>Bu sürümde veriler</h3><p>claude.ai sürümünde ilerleme, oyunu açan Claude hesabına bağlı olarak Claude'un depolamasında tutulur. Aile yarışması ve ortak hedef de Claude'un altyapısını kullanır.</p></section>`}
  <section class="detay"><h3>Haklarınız</h3><p>6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 11. maddesi uyarınca verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini ya da silinmesini isteme ve itiraz etme haklarına sahipsiniz. Talepleriniz için yukarıdaki iletişim yolunu kullanabilirsiniz.</p></section>
  <section class="detay"><h3>Çerez ve tarayıcı depolaması</h3><p>Oyun çerez kullanmaz; ilerleme tarayıcının yerel depolamasında tutulur. Bulut açıksa Google reCAPTCHA kendi teknik verilerini kullanabilir.</p></section>`;
  if(sekme==="kaynaklar")return ust+`<h2>Kaynaklar ve teşekkür</h2>
  <section class="detay"><h3>Kur'an metni</h3><p>Arapça metin <a href="https://tanzil.net" target="_blank" rel="noopener">Tanzil Projesi</a>'nden alınmıştır. Tanzil Quran Text, Copyright © 2007-2021 Tanzil Project. Metnin değiştirilmeden ve kaynak gösterilerek kullanılmasına izin verilmiştir.</p></section>
  <section class="detay"><h3>Meal</h3><p>Elmalılı Muhammed Hamdi Yazır, <i>Hak Dini Kur'an Dili</i> (1935–1938) mealinin sadeleştirilmiş hâli. Birkaç ayette çocukların anlayabilmesi için ifade yalınlaştırılmıştır.</p></section>
  <section class="detay"><h3>Kıraat</h3><p>Sure ve ayet sesleri: Şeyh Mişari Râşid el-Afasi. Kelime sesleri bu kayıtlardan kesilmiştir. Kayıtların telif hakkı kâriye aittir; kullanım izni ve kaynağı doğrulanmaktadır.</p></section>
  <section class="detay"><h3>Hikâye seslendirmesi</h3><p>Hikâyelerin anlatım bölümleri yapay zekâ sesleriyle (Microsoft Emel ve Ahmet) hazırlanmıştır; ayetler Mişari Râşid el-Afasi'nin okuyuşudur.</p></section>
  <section class="detay"><h3>Açıklamalar, sorular ve etkinlikler</h3><p>Sure açıklamaları, çocuk anlatımları, sorular ve etkinlikler bu projenin sure kitapları için hazırlanmıştır; hazırlıkta yapay zekâ desteği kullanılmıştır. Hadisler kaynak eser ve numarasıyla verilmiştir.</p></section>
  <section class="detay"><h3>Yazı tipleri ve yazılımlar</h3><ul><li>Amiri ve Rubik yazı tipleri: SIL Open Font License 1.1</li>${gh?`<li>Google Firebase (Apache-2.0) ve Google reCAPTCHA</li>`:""}</ul></section>
  <section class="detay"><h3>Lisans</h3><p>Oyunun kodu MIT lisanslıdır; özgün içerik (açıklamalar, sorular, etkinlikler, çizimler) Creative Commons BY-NC-SA 4.0 ile paylaşılır. Kur'an metni, kâri sesleri, meal ve yazı tipleri kendi sahiplerinin koşullarına tabidir ve bu lisansların dışındadır.</p></section>`;
  return ust+`<h2>Sureler Oyun Bahçesi hakkında</h2>
  <p>Çocukların ve ailelerin Fâtiha'yı, son cüzü, Yâsîn'i ve Âyetü'l-Kürsî'yi oynayarak, dinleyerek ve birlikte okuyarak öğrenmesi için hazırlanmış ücretsiz ve reklamsız bir oyun.</p>
  <section class="detay"><h3>Nasıl kullanırız?</h3><ul>
   <li><b>Her gün kısa:</b> 10–20 dakika yeter. Mola uyarısı küçüklerde 20 dakikada gelir.</li>
   <li><b>Önce dinle:</b> sure sayfasında ▶ ile kâriyi dinleyin, sonra yıldız oyunlarına geçin.</li>
   <li><b>Ezber:</b> "Ezber" sekmesi tekrar günlerini kendisi hatırlatır; son basamakta çocuk ayeti size okur, siz onaylarsınız.</li>
   <li><b>Ailece:</b> haftada bir "Aile halkası", istediğiniz zaman aile yarışması.</li>
   <li><b>Ebeveyn bölümü:</b> ana sayfadaki ebeveyn özetinden; ayarlar, şifre, namaz hazırlığı yolu ve bulut kaydı oradadır.</li></ul></section>
  <section class="detay"><h3>İçerik</h3><p>Meal, Elmalılı Hamdi Yazır'ın sadeleştirilmiş mealidir. Çocuk anlatımları sade ve korkutmayan bir dille yazılmıştır; ayrıntısı büyüyünce öğrenilecek ayetler küçüklere bu notla gösterilir. Kaynakların listesi "Kaynaklar" sekmesindedir.</p>
  <p>Bir hata görürseniz lütfen <a href="${ILETISIM_URL}" target="_blank" rel="noopener">bize yazın</a>.</p></section>`;}
function hakkinda(sekme){sekme=sekme||"hakkinda";CUR=null;baslik();setTabs();durSes();$("baslik").textContent="Hakkında";$("altbaslik").textContent="Sureler Oyun Bahçesi";
  const V=$("view");V.innerHTML=hakkindaHtml(sekme);$("hkG").onclick=()=>anaSayfa();
  V.querySelectorAll("[data-hk]").forEach(b=>b.onclick=()=>hakkinda(b.dataset.hk));window.scrollTo({top:0});}
{const a=document.getElementById("hakkindaAc");if(a)a.onclick=()=>hakkinda("hakkinda");}
