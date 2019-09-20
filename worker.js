

// Information below can be found at https://panel.guardiankey.io
// In Settings>AuthGroup, edit an authgroup, and go to tab "Deploy information"
const organization_id = ""
const authgroup_id = ""
const key = ""
const iv = ""

// Information below depends on your system.
// This is the name of the input field of the login page of your system.
const username_field= ""

// This is a URL of your system that logs the user out when accessed.
// If you don't have it, the worker will send events to GuardianKey
// But attempts will never be blocked!
// Something like  "https://mydomain.com/logout"
const logout_url =""

// A string that appears in the HTML of your system when
// the user fails the password. It should be exactly the same.
// Something like "wrong password" or "invalid pass"
const login_failed_string =""

// Use true if the username is the user's email address. Put false otherwise.
const username_is_email = true

// Use 'https://api.guardiankey.io/checkaccess' for GuardianKey in cloud
// If you don't know, just keep as is.
const api_url = 'https://api.guardiankey.io/checkaccess'

async function handleRequest(request) {
  return fetch(request)
}

async function handlePostRequest(request) {
  let reqBody = await readRequestPost(request.clone())
  let response =  await fetch(request)
  if(username_field in reqBody){
   let username = reqBody[username_field]
   let useremail = (username_is_email)? username : ""
   let resBody = await readRequestBody(response.clone())
   let login_failed=0
   if(resBody.includes(login_failed_string)){
     login_failed = 1
   }
   let gk_return = await check_access(request,username,useremail,login_failed)
    if(gk_return['response'] === 'BLOCK' && ! logout_url === "" ){
      return fetch(logout_url)
    }
  }
  return response
}


async function check_access(request,username,useremail,login_failed) {
	let event = await create_event(request,username,useremail,login_failed)
	let event_str = JSON.stringify(event)
  	let keybuff = str2ab8(atob(key))
    const baseKey = await crypto.subtle.importKey('raw', keybuff, { name: 'AES-CBC' },false, ['encrypt'], )
                                .catch(function(err){ console.error(err);	});

  let encoded = str2ab8(event_str)
  let iv1 =  str2ab8(atob(iv))
  let cipher = await crypto.subtle.encrypt({name: "AES-CBC", iv: iv1 }, baseKey, encoded )	
                           .catch(function(err){ console.error(err);	});

  let cipher_message = btoa(ab2str8(cipher))
  let jsonmsg = {"id": authgroup_id, "message":cipher_message }
  let content = JSON.stringify(jsonmsg)
  let headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}

  const init = { method: 'POST', headers: headers, body: content }
  const response = await fetch(api_url, init)
  const body = await response.json()
   return body
}

async function create_event(request,username,useremail,login_failed) {
	
	let event = {   "generatedTime": Math.trunc(Date.now()/1000),
					"agentId": "CloudFlare",
					"organizationId": organization_id,
					"authGroupId": authgroup_id,
					"service": "CloudFlare",
					"clientIP": request.headers.get('cf-connecting-ip'),
					"clientReverse": "",
					"userName": username,
					"authMethod": "",
					"loginFailed": login_failed,
					"userAgent": request.headers["user-agent"],
					"psychometricTyped": "",
					"psychometricImage": "",
					"event_type": "Authentication",
					"userEmail": useremail
					}
	return event
}

addEventListener('fetch', event => {
  const { request } = event
  const { url } = request
  if (request.method === 'POST') {
    return event.respondWith(handlePostRequest(request))
  }else if (request.method === 'GET') {
    return event.respondWith(handleRequest(request))
  }
})

async function readRequestBody(request) {
  const { headers } = request
  const contentType = headers.get('content-type')
  if (contentType.includes('application/json')) {
    const body = await request.json()
    return JSON.stringify(body)
  } else if (contentType.includes('application/text')) {
    const body = await request.text()
    return body
  } else if (contentType.includes('text/html')) {
    const body = await request.text()
    return body
  } else if (contentType.includes('form')) {
    const formData = await request.formData()
    let body = {}
    for (let entry of formData.entries()) {
      body[entry[0]] = entry[1]
    }
    return JSON.stringify(body)
  } else {
    let myBlob = await request.blob()
    var objectURL = URL.createObjectURL(myBlob)
    return objectURL
  }
}


async function readRequestPost(request) {
  const { headers } = request
  const contentType = headers.get('content-type')
  if (contentType.includes('form')) {
    const formData = await request.formData()
    let body = {}
    for (let entry of formData.entries()) {
      body[entry[0]] = entry[1]
    }
    return body
  }
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab8(str) {
  var buf = new ArrayBuffer(str.length); // 1 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
function ab2str8(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}
