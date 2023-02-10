/*
 * wifi_app.h
 *
 *  Created on: Jan 24, 2023
 *  Author: cquezada
 */

#ifndef MAIN_WIFI_APP_H_
#define MAIN_WIFI_APP_H_

#include "freertos/FreeRtos.h"
#include "freertos/event_groups.h"
#include "freertos/task.h"

#include "esp_netif.h"

// Callback typedef
typedef void (*wifi_connected_event_callback_t)(void);

#define WIFI_AP_SSID				"ESP32_AP" 			//AP  name
#define WIFI_AP_PASSWORD			"password"			//AP password
#define WIFI_AP_CHANNEL				1 					//AP channel
#define WIFI_AP_SSID_HIDDEN			0 					//AP visibility
#define WIFI_AP_MAX_CONNECTIONS		5 					//AP max clients
#define WIFI_AP_BEACON_INTERVAL		100 				//AP beacon: 100 milliseconds recommend
#define WIFI_AP_IP					"192.168.0.1" 		//AP default IP
#define WIFI_AP_GATEWAY				"192.168.0.1" 		//AP default Gateway (should be the same as the IP)
#define WIFI_AP_NETMASK				"255.255.255.0" 	//AP netmask
#define WIFI_AP_BANDWIDTH			WIFI_BW_HT20 		//AP bandwidth 20 MHz (40 MHz is the other option)
#define WIFI_STA_POWER_SAVE			WIFI_PS_NONE 		// Power save not used
#define MAX_SSID_LENGTH				32 					// IEEE standard maximum
#define MAX_PASSWORD_LENGTH			64 					// IEEE standard maximum
#define MAX_CONNECTION_RETRIES		5 					// Retry number on disconnect

// netif object for the station an access point
extern esp_netif_t* esp_netif_sta;
extern esp_netif_t* esp_netif_ap;

/**
 * Message IDs for the WiFi application task
 * @note Expand this based on your application requirements.
 */
typedef enum wifi_app_message
{
	WIFI_APP_MSG_START_HTTP_SERVER = 0,
	WIFI_APP_MSG_CONNECTING_FROM_HTTP_SERVER,
	WIFI_APP_MSG_STA_CONNECTED_GOT_IP,
	WIFI_APP_MSG_USER_REQUESTED_STA_DISCONNECT,
	WIFI_APP_MSG_LOAD_SAVED_CREDENTIALS,
	WIFI_APP_MSG_STA_DISCONNECTED,
} wifi_app_message_e;


/**
 * Structure for the message queue
 * @note Expend this based on application requierements e.g. add another type and parameter as required
 */
typedef struct wifi_app_queue_message
{
	wifi_app_message_e msgID;
} wifi_app_queue_message_t;

/**
 * Sends a message to the queue
 * @param megID message ID from the wifi_app_message_e enum.
 * @return pdTRUE if an item was successfully sent to the queue, otherwise pdFALSE.
 * @note Expand the parameter list based on your requirements e.g. how you've expanded the wifi_app_queue_message_t
 */

BaseType_t wifi_app_send_message(wifi_app_message_e msgID);

/**
 * Starts the WiFi RTOS task
 */
void wifi_app_start(void);

/**
 * Gets the wifi configuration
 */
wifi_config_t* wifi_app_get_wifi_config(void);

/**
 * Sets the callback function.
 */
void wifi_app_set_callback(wifi_connected_event_callback_t cb);

/**
 * Calls the callback function.
 */
void wifi_app_call_callback(void);


/**
 * Get the RSSI value of the WiFi connection.
 * @return curremt RSSI level
 */
int8_t wifi_app_get_rssi(void);


#endif /* MAIN_WIFI_APP_H_ */
