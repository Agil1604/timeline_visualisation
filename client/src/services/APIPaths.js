const API_BASE = "/api";

export const AUTH = {
  LOGIN:         `${API_BASE}/auth/login`,               // POST
  REFRESH:       `${API_BASE}/auth/refresh`,             // POST
  ME:            `${API_BASE}/users/me`,                 // GET
}

export const PROJECTS = {
  CREATE:          `${API_BASE}/projects/`,              // POST
  GET_ALL:         `${API_BASE}/projects/`,              // GET
  GET_ONE:        (id) => `${API_BASE}/projects/${id}`,  // GET
  UPDATE:         (id) => `${API_BASE}/projects/${id}`,  // PUT
  DELETE:         (id) => `${API_BASE}/projects/${id}`,  // DELETE
  UPDATE_PROJECT: (id) => `${API_BASE}/projects/${id}`,  // PATCH
};


export const USERS = {
  REGISTER:      `${API_BASE}/users/register`,           // POST
  CHANGE_PASS:   `${API_BASE}/users/change-password`,    // POST
  DELETE:        `${API_BASE}/users/me`,                 // DELETE
  ME:            `${API_BASE}/users/me`,                 // GET
};