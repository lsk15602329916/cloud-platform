"use strict";

import Vue from 'vue';
import axios from "axios";

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = 'http://118.25.85.198:8800/cloud-platform'
axios.defaults.baseURL = 'http://10.33.213.232:8800/cloud-platform'

// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let config = {
  // baseURL: process.env.baseURL || process.env.apiUrl || ""
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
};

const _axios = axios.create(config);

_axios.interceptors.request.use(
  function(config) {
    config.headers.Authorization = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJhdXRob3JpdGllcyI6ImFkZF9kZXZpY2UgYWRkX2RldmljZV9kYXRhIGFkZF91c2VyIGNoZWNrX3VzZXIgZGVsZXRlX2RldmljZSBkZWxldGVfZGV2aWNlX2RhdGEgZXhwb3J0X2RldmljZV9kYXRhIGZpbmRfY29tbW9uX3VzZXJfYnJpZWZfaW5mbyBmaW5kX2RldmljZV9kYXRhIGZpbmRfZGV2aWNlX2xpc3QgZmluZF91c2VyIGltcG9ydF9kZXZpY2VfZGF0YSB1cGRhdGVfZGV2aWNlIHVwZGF0ZV9kZXZpY2VfZGF0YSAiLCJpYXQiOjE2MDY0NjgxMTIsInN1YiI6ImFkbWluMSIsImV4cCI6MTYwODE5NjExMn0.UPruCenBwR9YAH66YvRaM1Bjn8OXMtNywfaUxb6bpHzp1q97CBZUWtEiYR2MO0mhszqOzmKe8AUMhOtNCUJ2gA'
      || window.sessionStorage.getItem('token')
    return config;
  },
  function(error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
_axios.interceptors.response.use(
  function(response) {
    // Do something with response data
    return response;
  },
  function(error) {
    // Do something with response error
    return Promise.reject(error);
  }
);

Plugin.install = function(Vue, options) {
  Vue.axios = _axios;
  window.axios = _axios;
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios;
      }
    },
    $axios: {
      get() {
        return _axios;
      }
    },
  });
};

Vue.use(Plugin)

export default Plugin;
