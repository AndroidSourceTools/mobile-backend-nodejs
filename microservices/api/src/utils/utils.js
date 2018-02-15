const request = require('request');
const fcmKey = process.env.FCM_KEY;

const dbAdminHeaders = {
  'Content-Type': 'application/json',
  'X-Hasura-User-Id': '1',
  'X-Hasura-Role': 'admin'
};

const dbUrl = 'http://data.hasura/v1/query';

const getRequestIdentity = (headers) => {
  return (
    headers
    ?
    {
      role: headers['x-hasura-role'] ? header['x-hasura-role'] : 'anonymous',
      user_id: headers['x-hasura-user-id']
    }
    :
    {role: 'anonymous', user_id: null}
  );
}

const sendPushNotification = (id) => {
  const fcmToken = getFcmToken(id);
  if (!fcmToken){
    return false;
  }
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'key=' + fcmKey
  };
  const options = {
    'url': 'https://fcm.googleapis.com/fcm/send',
    'headers' : headers,
    'method': 'POST',
    'body': JSON.stringify({
      'to': fcmToken,
      'data': {
        'title': 'Notif Title',
        'body': 'Notify Body Notif Body Notif Body Notif Body Notif Body'
      }
    })
  };
  return request(options, function (error, response, body) {
    if (error) {
      console.log('Error sending push notification to user_id ' + userId);
      console.log(error);
      return false;
    }
    if (response.statusCode == 200 || response.statusCode == 201 ){
      return true;
    }
    return false
  });
}


const getFcmToken = (id) => {
  let dataUrl = 'http://data.hasura/v1/query';
  let headers = {
    'Content-Type': 'application/json',
    'X-Hasura-User-Id': '1',
    'X-Hasura-Role': 'admin'
  };
  const options = {
    'url': dataUrl,
    'headers' : headers,
    'method': 'POST',
    'body': JSON.stringify({
      'type': 'select',
      'args': {
        'table': 'fcm_tokens',
        'columns': [
          'token'
        ],
        'where': {
          'user_id': id
        }
      }
    })
  };
  return request(options, function (error, response, body) {
    if (error) {
      console.log('Error fetching the token from databse for user_id ' + id);
      console.log(error);
      return null;
    }
    const resp = JSON.parse(body);
    return (resp[0] ? resp[0].token : null);
  });
}

module.exports = {
  sendPushNotification,
  getRequestIdentity,
  dbUrl,
  dbAdminHeaders
};
