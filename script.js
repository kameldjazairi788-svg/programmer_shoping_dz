// SHA-256 تشفير كلمات المرور
async function hashPass(msg){ const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg)); return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");}

// بيانات افتراضية
let users=[{id:1,username:"Rayane",password:"",role:"ownerdev"},{id:2,username:"DevUser",password:"",role:"dev"},{id:3,username:"SupportUser",password:"",role:"support"}];
let products=["Order Dev Samp","Order Dev Fiveem","Order Dev Website","Dev Application"];
let orders=[], currentUser=null;

// إعداد كلمات مرور مشفرة عند أول تحميل
(async()=>{for(let u of users){if(!u.password){u.password=await hashPass(u.username==="Rayane"?"devpro":u.username+"pass");}}localStorage.setItem("users",JSON.stringify(users));})();

// عرض صناديق
function showHome(){document.getElementById("homeBox").style.display="block";document.getElementById("registerBox").style.display="none";document.getElementById("loginBox").style.display="none";document.getElementById("dashboardBox").style.display="none";}
function showRegister(){document.getElementById("homeBox").style.display="none";document.getElementById("loginBox").style.display="none";document.getElementById("registerBox").style.display="block";document.getElementById("dashboardBox").style.display="none";}
function showLogin(){document.getElementById("homeBox").style.display="none";document.getElementById("registerBox").style.display="none";document.getElementById("loginBox").style.display="block";document.getElementById("dashboardBox").style.display="none";}

// تسجيل جديد User
async function register(){
const username=document.getElementById("regUsername").value.trim();
const password=document.getElementById("regPassword").value.trim();
const msg=document.getElementById("regMsg");
if(username===""||password===""){msg.style.color="#ff4d4d";msg.innerText="❌ الرجاء ملء جميع الحقول";return;}
users=JSON.parse(localStorage.getItem("users")||"[]");
if(users.some(u=>u.username===username)){msg.style.color="#ff4d4d";msg.innerText="❌ اسم المستخدم موجود مسبقاً";return;}
const newId=users.length>0?users[users.length-1].id+1:1;
const hashed=await hashPass(password);
users.push({id:newId,username,password:hashed,role:"user"});
localStorage.setItem("users",JSON.stringify(users));
msg.style.color="#00ffcc";msg.innerText="✅ تم التسجيل بنجاح! حسابك User تلقائيًا";
setTimeout(showLogin,1000);
}

// تسجيل دخول
async function login(){
const username=document.getElementById("loginUsername").value.trim();
const password=document.getElementById("loginPassword").value.trim();
const msg=document.getElementById("loginMsg");
users=JSON.parse(localStorage.getItem("users")||"[]");
const hashed=await hashPass(password);
const user=users.find(u=>u.username===username && u.password===hashed);
if(user){currentUser=user;msg.style.color="#00ffcc";msg.innerText="✅ تم تسجيل الدخول";setTimeout(showDashboard,500);}
else{msg.style.color="#ff4d4d";msg.innerText="❌ اسم المستخدم أو كلمة المرور خاطئ";}
}

// لوحة التحكم
function showDashboard(){
document.getElementById("homeBox").style.display="none";
document.getElementById("registerBox").style.display="none";
document.getElementById("loginBox").style.display="none";
document.getElementById("dashboardBox").style.display="block";

document.getElementById("welcomeUser").innerText="مرحباً "+currentUser.username+"! (Role: "+currentUser.role+")";

// إدارة المستخدمين (Owner فقط)
const userSettings=document.getElementById("userSettings");
userSettings.innerHTML="";
if(currentUser.role.includes("owner")){
let table=document.createElement("table");
let header=table.insertRow();["ID","Username","Role","Change Role","Delete"].forEach(t=>{let th=document.createElement("th");th.innerText=t;header.appendChild(th);});
users.forEach(u=>{
let row=table.insertRow();row.className=u.role;row.insertCell(0).innerText=u.id;row.insertCell(1).innerText=u.username;row.insertCell(2).innerText=u.role;
// تغيير الدور
let roleCell=row.insertCell(3);
if(u.username!==currentUser.username){let select=document.createElement("select");select.className="roleSelect";["user","dev","support","ownerdev"].forEach(r=>{let option=document.createElement("option");option.value=r;option.text=r;if(u.role===r) option.selected=true;select.appendChild(option);});
select.onchange=()=>{u.role=select.value;localStorage.setItem("users",JSON.stringify(users));showDashboard();};
roleCell.appendChild(select);}else roleCell.innerText="-";
// حذف
let delCell=row.insertCell(4);
if(u.username!==currentUser.username){let btn=document.createElement("button");btn.innerText="حذف";btn.onclick=()=>{if(confirm("هل تريد حذف "+u.username+"؟")){users=users.filter(x=>x.id!==u.id);localStorage.setItem("users",JSON.stringify(users));showDashboard();}};delCell.appendChild(btn);}else delCell.innerText="-";
});
userSettings.appendChild(table);
}

// إدارة المنتجات (Owner فقط)
const productsBox=document.getElementById("productsBox");
productsBox.innerHTML="";
if(currentUser.role.includes("owner")){
products.forEach((p,i)=>{let card=document.createElement("div");card.className="productCard";card.innerHTML=`<p>اسم المنتج: <b>${p}</b></p>`;let btnEdit=document.createElement("button");btnEdit.innerText="تعديل";btnEdit.onclick=()=>{let newName=prompt("أدخل الاسم الجديد",p);if(newName){products[i]=newName;showDashboard();}};let btnDel=document.createElement("button");btnDel.innerText="حذف";btnDel.onclick=()=>{if(confirm("حذف المنتج "+p+"؟")){products.splice(i,1);showDashboard();}};card.appendChild(btnEdit);card.appendChild(btnDel);productsBox.appendChild(card);});document.getElementById("addProductBox").style.display="block";}
else document.getElementById("addProductBox").style.display="none";

// الطلبات
const ordersBox=document.getElementById("ordersBox");
ordersBox.innerHTML="";
orders.forEach(o=>{let card=document.createElement("div");card.className="orderCard";card.innerHTML=`<p><b>${o.product}</b></p><p>Requested by: ${o.user}</p><p>Status: ${o.status}</p>`;ordersBox.appendChild(card);});

// Ticket Support
const ticketsBox=document.getElementById("ticketsBox");
ticketsBox.innerHTML="";
if(["user","dev","support","ownerdev"].some(r=>currentUser.role.includes(r))){
let ta=document.createElement("textarea");ta.placeholder="اكتب تذكرتك هنا...";ticketsBox.appendChild(ta);
let btn=document.createElement("button");btn.innerText="إرسال التذكرة";btn.onclick=()=>{if(ta.value.trim()!==""){alert("تم إرسال التذكرة:\n"+ta.value);ta.value="";}else alert("❌ الرجاء كتابة التذكرة");};ticketsBox.appendChild(btn);}
}

// إضافة منتج جديد
function addProduct(){let name=document.getElementById("newProductName").value.trim();if(name){products.push(name);document.getElementById("newProductName").value="";showDashboard();}}
function logout(){currentUser=null;showHome();document.getElementById("loginUsername").value="";document.getElementById("loginPassword").value="";document.getElementById("loginMsg").innerText="";}

// تشغيل الصفحة على Home
showHome();
