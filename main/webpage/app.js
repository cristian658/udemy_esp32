/**
 * Add gobals here
 */
var seconds 	= null;
var otaTimerVar =  null;
var wifiConnectInterval = null;

/**
 * Replace function ready Jquery ($(document).ready)
 * https://learnwithparam.com/blog/vanilla-js-equivalent-of-jquery-ready/
 */
function ready(callbackFunc) {
  if (document.readyState !== 'loading') {
    // Document is already ready, call the callback directly
    callbackFunc();
  } else if (document.addEventListener) {
    // All modern browsers to register DOMContentLoaded
    document.addEventListener('DOMContentLoaded', callbackFunc);
  } else {
    // Old IE browsers
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState === 'complete') {
        callbackFunc();
      }
    });
  }
}

/**
 * Initialize functions here.
 */
ready(function() {
  getSSID();
  getUpdateStatus();
  startDHTSensorInterval();
  startLocalTimeInterval();
  getConnectInfo();
  document.getElementById("connect_wifi").addEventListener("click", function(){
  	checkCredentials();
  }); 
  document.getElementById("disconnect_wifi").addEventListener("click", function(){
  	disconnectWifi();
  }); 
  
});

/**
 * Gets file name and size for display on the web page.
 */        
function getFileInfo() 
{
    var x = document.getElementById("selected_file");
    var file = x.files[0];

    document.getElementById("file_info").innerHTML = "<h4>File: " + file.name + "<br>" + "Size: " + file.size + " bytes</h4>";
}

/**
 * Handles the firmware update.
 */
function updateFirmware() 
{
    // Form Data
    var formData = new FormData();
    var fileSelect = document.getElementById("selected_file");
    
    if (fileSelect.files && fileSelect.files.length == 1) 
	{
        var file = fileSelect.files[0];
        formData.set("file", file, file.name);
        document.getElementById("ota_update_status").innerHTML = "Uploading " + file.name + ", Firmware Update in Progress...";

        // Http Request
        var request = new XMLHttpRequest();

        request.upload.addEventListener("progress", updateProgress);
        request.open('POST', "/OTAupdate");
        request.responseType = "blob";
        request.send(formData);
    } 
	else 
	{
        window.alert('Select A File First')
    }
}

/**
 * Progress on transfers from the server to the client (downloads).
 */
function updateProgress(oEvent) 
{
    if (oEvent.lengthComputable) 
	{
        getUpdateStatus();
    } 
	else 
	{
        window.alert('total size is unknown')
    }
}

/**
 * Posts the firmware udpate status.
 */
function getUpdateStatus() 
{
    var xhr = new XMLHttpRequest();
    var requestURL = "/OTAstatus";
    xhr.open('POST', requestURL, false);
    xhr.send('ota_update_status');

    if (xhr.readyState == 4 && xhr.status == 200) 
	{		
        var response = JSON.parse(xhr.responseText);
						
	 	document.getElementById("latest_firmware").innerHTML = response.compile_date + " - " + response.compile_time

		// If flashing was complete it will return a 1, else -1
		// A return of 0 is just for information on the Latest Firmware request
        if (response.ota_update_status == 1) 
		{
    		// Set the countdown timer time
            seconds = 10;
            // Start the countdown timer
            otaRebootTimer();
        } 
        else if (response.ota_update_status == -1)
		{
            document.getElementById("ota_update_status").innerHTML = "!!! Upload Error !!!";
        }
    }
}

/**
 * Displays the reboot countdown.
 */
function otaRebootTimer() 
{	
    document.getElementById("ota_update_status").innerHTML = "OTA Firmware Update Complete. This page will close shortly, Rebooting in: " + seconds;

    if (--seconds == 0) 
	{
        clearTimeout(otaTimerVar);
        window.location.reload();
    } 
	else 
	{
        otaTimerVar = setTimeout(otaRebootTimer, 1000);
    }
}

/**
 * Gets DHT22 sensor temperature and humidity values of display othe web page.
 */
function getDHTSensorValues()
{
	const temperature = document.getElementById("temperature_reading");
	const humidity = document.getElementById("humidity_reading");
	fetch('/dhtSensor.json')
  	.then(response => response.json())
  	.then(data => {
		  temperature.innerHTML = data.temp;
		  humidity.innerHTML = data.humidity;
  	});
}

/**
 * Sets the interval for getting the updated DHT22 sensor values
 */
 function startDHTSensorInterval()
 {
	 setInterval(getDHTSensorValues, 5000);
 }
 
 /**
 * Clears the connection status interval.
 */
function stopWifiConnectStatusInterval()
{
	if (wifiConnectInterval != null)
	{
		clearInterval(wifiConnectInterval);
		wifiConnectInterval = null;
	}
}

/**
 * Gets the WiFi connection status.
 */
function getWifiConnectStatus()
{
	var xhr = new XMLHttpRequest();
	var requestURL = "/wifiConnectStatus";
	xhr.open('POST', requestURL, false);
	xhr.send('wifi_connect_status');
	
	if (xhr.readyState == 4 && xhr.status == 200)
	{
		var response = JSON.parse(xhr.responseText);
		
		document.getElementById("wifi_connect_status").innerHTML = "Connecting...";
		
		if (response.wifi_connect_status == 2)
		{
			document.getElementById("wifi_connect_status").innerHTML = "<h4 class='rd'>Failed to Connect. Please check your AP credentials and compatibility</h4>";
			stopWifiConnectStatusInterval();
		}
		else if (response.wifi_connect_status == 3)
		{
			document.getElementById("wifi_connect_status").innerHTML = "<h4 class='gr'>Connection Success!</h4>";
			stopWifiConnectStatusInterval();
		}
	}
}

/**
 * Starts the interval for checking the connection status.
 */
function startWifiConnectStatusInterval()
{
	wifiConnectInterval = setInterval(getWifiConnectStatus, 2800);
}

/**
 * Connect WiFi function called using the SSID and password entered into the text fields.
 */
function connectWifi()
{
	// Get the SSID and password
	selectedSSID = document.getElementById("connect_ssid").value;
	pwd = document.getElementById("connect_pass").value;
	
	
	let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'my-connect-ssid': selectedSSID,
            'my-connect-pwd': pwd
        },
        cache: "no-cache",
        body: JSON.stringify({timestamp: Date.now()})
    }
    
	fetch('/wifiConnect.json', options)
  		.then(response => response.json())
	  	.then(data => {
			  console.log(data);
	  	})
	  	.catch(error => {
			  console.log(error);
		});
		
	startWifiConnectStatusInterval();
}

/**
 * Checks credentials on connect_wifi button click.
 */
function checkCredentials()
{
	errorList = "";
	credsOk = true;
	
	selectedSSID = document.getElementById("connect_ssid").value;// $("#connect_ssid").val();
	pwd = document.getElementById("connect_pass").value; //$("#connect_pass").val();
	const wifiConnectCredentialsErrors = document.getElementById("wifi_connect_credentials_errors");
	if (selectedSSID === "")
	{
		errorList += "<h4 class='rd'>SSID cannot be empty!</h4>";
		credsOk = false;
	}
	if (pwd === "")
	{
		errorList += "<h4 class='rd'>Password cannot be empty!</h4>";
		credsOk = false;
	}
	if (credsOk === false)
	{
		wifiConnectCredentialsErrors.innerHTML = errorList
		
	}
	else
	{
		wifiConnectCredentialsErrors.innerHTML = "";
		connectWifi();    
	}
}

/**
 * Shows the WiFi password if the box is checked.
 */
function showPassword()
{
	var x = document.getElementById("connect_pass");
	if (x.type === "password")
	{
		x.type = "text";
	}
	else
	{
		x.type = "password";
	}
}

/**
 * Gets the connection information for displaying on the web page.
 */
function getConnectInfo()
{
	
	fetch('/wifiConnectInfo.json')
  		.then(response => response.json())
	  	.then(data => {
			document.getElementById('connected_ap_label').innerHTML = "Connected to: ";
			document.getElementById('connected_ap').innerHTML = data["ap"];
			
			document.getElementById('ip_address_label').innerHTML = "IP Address: ";
			document.getElementById('wifi_connect_ip').innerHTML = data["ip"];
			
			document.getElementById('netmask_label').innerHTML = "Netmask: ";
			document.getElementById('wifi_connect_netmask').innerHTML = data["netmask"];
			
			document.getElementById('gateway_label').innerHTML = "Gateway: ";
			document.getElementById('wifi_connect_gw').innerHTML = data["gw"];
		
			document.getElementById('disconnect_wifi').style.display = 'block';
	  	})
	  	.catch(error => {
			  console.log(error);
		});
}

/**
 * Disconnects Wifi once the disconnect button is pressed and reloads the web page.
 */
function disconnectWifi()
{
	
	let options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        cache: "no-cache",
        body: JSON.stringify({timestamp: Date.now()})
    }
    
	fetch('/wifiDisconnect.json', options)
  		.then(response => response.json())
	  	.then(data => {
			  console.log(data);
	  	})
	  	.catch(error => {
			  console.log(error);
		});
	// Update the web page
	setTimeout("location.reload(true);", 2000);
}

/**
 * Sets the interval for displaying local time.
 */
function startLocalTimeInterval()
{
	setInterval(getLocalTime, 10000);
}

/**
 * Gets the local time.
 * @note connect the ESP32 to the internet and the time will be updated.
 */
function getLocalTime()
{
	const localTime = document.getElementById("local_time");
	fetch('/localTime.json')
  		.then(response => response.json())
	  	.then(data => {
			  localTime.innerHTML = data["time"]
			  console.log(data);
	  	})
	  	.catch(error => {
			  console.log(error);
		});
	
}

/**
 * Gets the ESP32's access point SSID for displaying on the web page.
 */
function getSSID()
{
	const apSSID = document.getElementById("ap_ssid");
	fetch('/apSSID.json')
  		.then(response => response.json())
	  	.then(data => {
			  apSSID.innerHTML = data["ssid"]
			  console.log(data);
	  	})
	  	.catch(error => {
			  console.log(error);
		});
	
}


