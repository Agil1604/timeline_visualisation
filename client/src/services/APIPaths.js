export const API_BASE = "/api";

export const AUTH = {
  REGISTER:      `${API_BASE}/auth/register`,            // POST
  LOGIN:         `${API_BASE}/auth/login`,               // POST
  REFRESH:       `${API_BASE}/auth/refresh`,             // POST
  ME:            `${API_BASE}/auth/me`,                  // GET
  CHANGE_PASS:   `${API_BASE}/auth/change-password`,     // POST
  DELETE:        `${API_BASE}/auth/`,                    // DELETE
}

export const PROJECTS = {
  CREATE:          `${API_BASE}/projects/`,              // POST
  GET_ALL:         `${API_BASE}/projects/`,              // GET
  GET_ONE:        (id) => `${API_BASE}/projects/${id}`,  // GET
  UPDATE:         (id) => `${API_BASE}/projects/${id}`,  // PUT
  DELETE:         (id) => `${API_BASE}/projects/${id}`,  // DELETE
  UPDATE_PROJECT: (projectType, id) => 
    `${API_BASE}/projects/${projectType}/${id}`,         // PATCH
};


// export const USERS = {
//   UPDATE:  (id) => `${API_BASE}/users/${id}`,          // PATCH/PUT
//   DELETE:  (id) => `${API_BASE}/users/${id}`,          // DELETE
// };