# GuardianKey for Cloudflare (worker)

This is a Cloudflare worker to integrate with GuardianKey.

GuardianKey is a solution to protect systems against authentication attacks. It uses Artificial Intelligence to detect if access attempts are from legitimate users. Attackers can be blocked even using the right password. GuardianKey provides an attack risk in real-time based on the user’s behavior, threat intelligence, and psychometrics (or behavioral biometrics). You can notify your users, block or log the attempts.

Learn more how GuardianKey works:
- https://guardiankey.io/
- https://guardiankey.io/resource/folder-guardian-key.pdf
- https://guardiankey.io/products/guardiankey-auth-security-enterprise/
- https://guardiankey.io/documentation/documentation-for-users/
- https://youtu.be/SZLTaQUpIas
- https://youtu.be/R5QFcH4bXuA

GuardianKey has free and paid plans, check it at https://guardiankey.io/services/guardiankey-auth-security-lite/

## These instructions in video

[![Watch the video](https://img.youtube.com/vi/SZLTaQUpIas/hqdefault.jpg)](https://youtu.be/SZLTaQUpIas)


## Create an account at GuardianKey

Access the registering form at https://panel.guardiankey.io/auth/register and follow the instructions.

You will need the deploy information to configure your worker. In the panel, ``Settings->Auth Groups->Edit->Deployment information``.

## Deploy the worker in Cloudflare

Attention: Cloudflare requires Google Chrome for the following procedures.

- Access the Cloudflare's administration panel, at https://dash.cloudflare.com/ . 
1. Click on your domain.
1. Click on the Workers menu.
1. Click on "Manage Workers".
1. Click on "Create a Worker".
1. Copy the script at https://raw.githubusercontent.com/guardiankey/guardiankey-cloudflare-worker/master/worker.js into the script edition area, in the left side.
1. In the right side, type the URL of the login page of your system.
1. Set-up the variables at the script header, details in the next Section.
1. Click on Update Preview.
1. Try to access your system.
1. Access https://panel.guardiankey.io and check if events are arriving there.
1. Save and Deploy the script, button in the bottom of the page.
1. Goes back to the Dashboard, click on left indicator, before the scripts name, below the Cloudflare logo (top-left).
1. Rename de worker to "guardiankey".
1. Go to the dash main page, clicking on your site's domain, near the Cloudflare logo (top-left).
1. Go to Workers again.
1. Add a route to the worker, click on "Add route"
1. Insert ``"https://*yourdomain.com/*"``, and select "guardiankey".
1. Done!
1. Check directly in your website. Events should appear in the GuardianKey's panel.

## How to find information to configure the worker

### GuardianKey's deployment information

Variables below can be filled using the information available in the GuardianKey's administration panel, ``Settings->Auth Groups->Edit->Deployment information``.
Just copy and past it.

```
const organization_id = ""
const authgroup_id = ""
const key = ""
const iv = ""
```

### GuardianKey's deployment information

Variable below is the name of the input field of the username, submitted to your system in the login.

```
const username_field= ""
```

The easiest way to see this information is to open Google Chrome, click on the username field, click the right mouse button and "inspect". 
The input should appear selected in the inspection panel.
Other forms:
- see the source code of the login page (control+U) and search for ``<input ... name="?"...>``. It may have more than one input field, search for username one.
- press F12, and search for the field (https://developers.google.com/web/tools/chrome-devtools/dom/).


Variable below is an URL of your system to logout a user. 
This is used for the worker to logout an attacker before it access your system.
If you don't have it, the worker will send events to GuardianKey, but attempts will never be blocked!
It is something like  "https://mydomain.com/logout".

```
const logout_url =""
```

Variable below is a string that appears in the HTML generated by your web application when the login attempt fails.
Usually it is like you see it in the page, however, it must be as it is in the HTML.
You can fail a password when accessing your system and then, select the information, right click, and inspect.
It is something like "wrong password" or "invalid pass".

```
const login_failed_string =""
```

Set the variable below true if the username is the user's email address. Put false otherwise.
If false, GuardianKey will not be able to send messages to your users.
To overcome this, use a webhook to process the notifications
(https://guardiankey.io/documentation/api/#receiving-via-webhook).

```
const username_is_email = true
```


### GuardianKey's API URL

If you are using GuardianKey in cloud, just leave the variable below as it is. 
Otherwise, provide the URL of your GuardianKey instance.


```
const api_url = 'https://api.guardiankey.io/checkaccess'
```


## Troubleshooting

### _Requests to the server have been blocked by an extension_

This error may occur in the testing mode of Cloudflare worker.
It happens because your site is referring to somewhere out of the Cloudflare testing platform.
To overcome this, you can replace the references to your site in the worker. 
For example, suppose that your form is posting to action="https://yourdomain/mypage.php", you can
use the code commented at lines 34 and 57 to replace this.

We note that this error may occur only when testing the worker at Cloudflare. In production, it should not occur.

## How the worker works?

- The worker intercepts all POSTs to your site that have the variable "username_field" posted. 
- This is used to create an event and send it to the GuardianKey engine.
- GuardianKey processes, saves, and replies a ACCEPT/BLOCK information.
- If blocked, the worker invokes the URL "logout_url".
- Events can be seen in the GuardianKey administration panel.

## Support

- Contact-us via contact@guardiankey.io
- Send message to the community forum https://groups.google.com/forum/#!forum/guardiankey

