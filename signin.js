const email = document.getElementById("email").value;
const password = document.getElementById("password").value;
const submit  = document.getElementById("submit");
const url = "https://smartplateapi.onrender.com";
const f= async() =>{
    const res = await fetch(url + "/auth",{
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({token: localStorage.getItem('token')})
    })
    const data= await res.json();  
    if (res.status == 200){
        window.location.href = 'dashboard.html'
    }
}
f();