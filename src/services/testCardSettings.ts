export const TEST_CARD_KEY = "sat-practice-test-card-v1";
export const STUDENT_NAME_KEY = "sat-practice-name";

export const defaultTestCard = {
  testName: "SAT",
  date: "Your teacher will let you know your test date soon.",
  arrivalTime: "",
  doorsClose: "",
  school: "Your test center",
  address: "Add your test center address in test details.",
  accommodations: "You have no approved accommodations for this test.",
  status: "On test day, don’t wait for your proctor. Check in right away.",
  buttonLabel: "Check In Now",
  overviewLabel: "Exam Overview",
  overview:
    "This practice test includes two Reading and Writing modules, a ten-minute break, and two Math modules. The timer starts after you confirm your code and select Start Test.",
  checklist:
    "Charge your device and connect to the required Wi-Fi.\nClose other applications.\nHave your start code ready.\nFollow your test organizer’s instructions.",
  showScoreSends: false,
  scoreSends:
    "This practice app does not send scores to colleges. Ask your test organizer about your practice results.",
};

export type TestCardSettings = typeof defaultTestCard;

export function loadTestCard(): TestCardSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(TEST_CARD_KEY) || "null");
    if (!saved || typeof saved !== "object") return { ...defaultTestCard };
    const result = { ...defaultTestCard };
    for (const key of Object.keys(
      defaultTestCard,
    ) as (keyof TestCardSettings)[]) {
      if (key === "showScoreSends") {
        if (typeof saved[key] === "boolean") result[key] = saved[key];
      } else if (typeof saved[key] === "string" && saved[key].length <= 4000) {
        result[key] = saved[key];
      }
    }
    return result;
  } catch {
    return { ...defaultTestCard };
  }
}

export function loadStudentName(): string {
  try {
    return localStorage.getItem(STUDENT_NAME_KEY) || "";
  } catch {
    return "";
  }
}
