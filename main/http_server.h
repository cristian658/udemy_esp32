/*
 * http_server.h
 *
 *  Created on: Jan 25, 2023
 *      Author: cquezada
 */

#ifndef MAIN_HTTP_SERVER_H_
#define MAIN_HTTP_SERVER_H_

#include "freertos/FreeRtos.h"
#include "freertos/event_groups.h"
#include "freertos/task.h"


/**
 *  Messages for the HTTP monitor
 */
typedef enum http_server_message
{
	HTTP_MSG_WIFI_CONNECT_INIT = 0,
	HTTP_MSG_WIFI_CONNECT_SUCCESS,
	HTTP_MSG_WIFI_CONNECT_FAIL,
	HTTP_MSG_OTA_UPDATE_SUCCESSFUL,
	HTTP_MSG_OTA_UPDATE_FAILED,
	HTTP_MSG_OTA_UPDATE_INITIALIZED,
} http_server_message_e;

/**
 *  Structure for the messagee queue
 */
typedef struct http_server_queue_message
{
	http_server_message_e msgID;
} http_server_queue_message_t;

/**
 *  Sends a message to the queue
 *  @param msgID message ID from the http_server_message_e enum
 *  @return pdTRUE if an item was successfully sent to the queue, otherwise pdFalse.
 *  @note Expand the parameter list based on your requirements e.g. how you've expanded the http_server_queue_message_t.
 */

BaseType_t http_server_monitor_send_message(http_server_message_e msgID);

/**
 * Starts the HTTP server.
 */
void http_server_start(void);

/**
 * Stops the HTTP server.
 */

void http_server_stop(void);

#endif /* MAIN_HTTP_SERVER_H_ */
