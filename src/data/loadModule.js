// src/data/loadModule.js
import rw1 from "./rw1.json";
import rw2 from "./rw2.json";
import m1  from "./m1.json";
import m2  from "./m2.json";

const modules = { rw1, rw2, m1, m2 };

// Возвращаем Promise, чтобы TestPage с .then() работал как раньше
export async function loadModule(id = "rw1") {
  return modules[id] || modules.rw1;
}
