var state = {
  loggedIn:false,
  name:"",
  role:"receptionist",
  institution:"Windhoek Central Hospital",
  patient:null,
  encounter:false,
  audit:[]
};

var patients = {
  "90051400123":{
    vnId:"VN-00012847",
    name:"Anna Amutenya",
    dob:"14 May 1990",
    sex:"Female",
    nationality:"Namibian",
    phone:"+264 81 555 0142",
    address:"Windhoek",
    coverage:"State patient",
    provider:"Public healthcare",
    allergies:"Penicillin - severe reaction",
    conditions:"Hypertension; Migraine",
    medication:"Amlodipine 5 mg once daily",
    encounters:[
      ["03 Aug 2026","Oshakati Intermediate Hospital","Outpatient","Persistent headaches","Migraine"],
      ["17 Mar 2026","Katutura Intermediate Hospital","Emergency","Abdominal pain","Resolved"]
    ]
  },
  "P99887766":{
    vnId:"VN-00048293",
    name:"Tendai Moyo",
    dob:"02 February 1988",
    sex:"Male",
    nationality:"Zimbabwean",
    phone:"+264 81 330 1010",
    address:"Windhoek",
    coverage:"Private medical aid",
    provider:"Example Health Fund",
    allergies:"No known drug allergies",
    conditions:"Asthma",
    medication:"Salbutamol inhaler as needed",
    encounters:[
      ["29 Jul 2026","Windhoek Central Hospital","Emergency","Asthma exacerbation","Asthma"]
    ]
  }
};

function roleLabel(){
  if(state.role==="doctor") return "Doctor";
  if(state.role==="nurse") return "Nurse";
  if(state.role==="billing") return "Billing Officer";
  return "Receptionist";
}
function canClinical(){ return state.role==="doctor" || state.role==="nurse"; }
function canCoverage(){ return state.role==="receptionist" || state.role==="billing"; }
function canCheckIn(){ return state.role==="receptionist" || state.role==="nurse"; }

function addAudit(action,result){
  state.audit.unshift([new Date().toLocaleString(),state.name,roleLabel(),action,result||"GRANTED"]);
}

function esc(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function showLogin(){
  document.getElementById("userInfo").innerHTML="Not signed in";
  document.getElementById("screen").innerHTML =
    '<div class="card" style="max-width:460px;margin:40px auto">' +
    '<h1>VeriNam</h1>' +
    '<p class="small">Healthcare prototype - fictional demo data only.</p>' +
    '<label>Name</label><input id="name" value="Demo User">' +
    '<label>Role</label><select id="role">' +
      '<option value="receptionist">Receptionist</option>' +
      '<option value="nurse">Nurse</option>' +
      '<option value="doctor">Doctor</option>' +
      '<option value="billing">Billing Officer</option>' +
    '</select>' +
    '<label>Institution</label><select id="institution">' +
      '<option>Windhoek Central Hospital</option>' +
      '<option>Oshakati Intermediate Hospital</option>' +
      '<option>Walvis Bay State Hospital</option>' +
    '</select>' +
    '<button onclick="login()">Sign in</button>' +
    '</div>';
}
function login(){
  state.loggedIn=true;
  state.name=document.getElementById("name").value || "Demo User";
  state.role=document.getElementById("role").value;
  state.institution=document.getElementById("institution").value;
  addAudit("Signed in","GRANTED");
  showDashboard();
}
function topNav(){
  document.getElementById("userInfo").innerHTML=esc(state.name)+" · "+roleLabel()+" · "+esc(state.institution);
  return '<nav class="card">' +
    '<button onclick="showDashboard()">Dashboard</button>' +
    '<button onclick="showLookup()">Patient Lookup</button>' +
    '<button onclick="showAudit()">Audit Log</button>' +
    '<button class="secondary" onclick="logout()">Sign out</button>' +
    '</nav>';
}
function logout(){
  state.loggedIn=false; state.patient=null; state.encounter=false; state.audit=[];
  showLogin();
}
function showDashboard(){
  var s=topNav();
  s+='<div class="card"><h1>Dashboard</h1><p class="small">Find a patient by simulated ID or passport scan.</p>' +
     '<input id="search" placeholder="Try 90051400123 or P99887766">' +
     '<button onclick="searchPatient()">Scan / Search</button></div>';
  document.getElementById("screen").innerHTML=s;
}
function showLookup(){ showDashboard(); }
function searchPatient(){
  var v=document.getElementById("search").value;
  var p=patients[v];
  if(!p){ alert("No matching fictional patient. Try 90051400123 or P99887766"); return; }
  state.patient=p; state.encounter=false;
  addAudit("Identified patient "+p.vnId,"GRANTED");
  showPatient();
}
function info(label,value){
  return '<div class="row"><div class="label">'+esc(label)+'</div><div class="value">'+esc(value)+'</div></div>';
}
function showPatient(){
  var p=state.patient;
  var s=topNav();
  s+='<div class="card"><h1>'+esc(p.name)+'</h1><span class="badge">Identity verified</span>' +
     '<p class="small">'+esc(p.vnId)+' · '+esc(p.dob)+' · '+esc(p.sex)+' · '+esc(p.nationality)+'</p></div>';

  if(state.encounter){
    s+='<div class="card"><b>Active encounter:</b> '+esc(state.institution)+'</div>';
  } else {
    s+='<div class="card restricted">No active encounter. Clinical access is restricted.</div>';
  }

  s+='<div class="grid">';
  s+='<div class="card"><h3>Patient details</h3>'+info("Phone",p.phone)+info("Address",p.address);
  if(canCheckIn() && !state.encounter) s+='<button onclick="checkIn()">Check in patient</button>';
  if(state.encounter) s+='<button class="secondary" onclick="closeEncounter()">Close encounter</button>';
  s+='</div>';

  s+='<div class="card"><h3>Healthcare coverage</h3>';
  if(canCoverage()) s+=info("Funding type",p.coverage)+info("Provider",p.provider);
  else s+='<div class="restricted">Your role does not require detailed coverage information.</div>';
  s+='</div></div>';

  s+='<div class="card"><h3>Clinical summary</h3>';
  if(canClinical() && state.encounter){
    addAudit("Viewed clinical summary","GRANTED");
    s+=info("Allergies",p.allergies)+info("Conditions",p.conditions)+info("Medication",p.medication);
  } else {
    if(!canClinical()) addAudit("Attempted clinical summary access","DENIED");
    s+='<div class="restricted">Clinical information requires an authorised clinical role and an active encounter.</div>';
  }
  s+='</div>';

  s+='<div class="card"><h3>Previous encounters</h3><table><tr><th>Date</th><th>Facility</th><th>Department</th><th>Reason</th><th>Diagnosis</th></tr>';
  var i,e;
  for(i=0;i<p.encounters.length;i++){
    e=p.encounters[i];
    s+='<tr><td>'+esc(e[0])+'</td><td>'+esc(e[1])+'</td><td>'+esc(e[2])+'</td><td>'+esc(e[3])+'</td><td>'+esc(canClinical()&&state.encounter?e[4]:"Restricted")+'</td></tr>';
  }
  s+='</table></div>';
  document.getElementById("screen").innerHTML=s;
}
function checkIn(){
  state.encounter=true;
  addAudit("Opened encounter for "+state.patient.vnId,"GRANTED");
  showPatient();
}
function closeEncounter(){
  state.encounter=false;
  addAudit("Closed encounter for "+state.patient.vnId,"GRANTED");
  showPatient();
}
function showAudit(){
  var s=topNav();
  s+='<div class="card"><h1>Audit Log</h1><table><tr><th>Time</th><th>User</th><th>Role</th><th>Action</th><th>Result</th></tr>';
  var i,a;
  for(i=0;i<state.audit.length;i++){
    a=state.audit[i];
    s+='<tr><td>'+esc(a[0])+'</td><td>'+esc(a[1])+'</td><td>'+esc(a[2])+'</td><td>'+esc(a[3])+'</td><td>'+esc(a[4])+'</td></tr>';
  }
  if(state.audit.length===0) s+='<tr><td colspan="5">No audit events yet.</td></tr>';
  s+='</table></div>';
  document.getElementById("screen").innerHTML=s;
}

showLogin();