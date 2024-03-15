const eventsAPIs = (function () {
  const API_URL = "http://localhost:3000/events";

  async function getEvents() {
    return fetch(API_URL).then((res) => res.json());
  }

  async function addEvent(newEvent) {
    return fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEvent),
    }).then((res) => res.json());
  }

  return {
    getEvents,
    addEvent
  };

})();

class EventsView {
  constructor() {
    this.addEventButton = document.querySelector("#addEventButton");
    this.eventList = document.querySelector(".event-list");
  }

  renderEvents(events) {
    this.eventList.innerHTML = "";
    events.forEach((event) => {
      this.renderNewEvent(event);
    })
  }

  renderNewEvent(newEvent) {
    this.eventList.appendChild(this.createEventElement(newEvent));
  }

  createEventElement(event) {
    const eventElement = document.createElement("tr");
    eventElement.classList.add("event");
    eventElement.setAttribute("id", event.id);
    eventElement.innerHTML = `<td><input value="${event.eventName}"></td>`;
    return eventElement;
  }
}

class EventsModel {
  #events;
  constructor(events = []) {
    this.#events = events;
  }

  getEvents() {
    return this.#events;
  }

  setEvents(newEvents) {
    this.#events = newEvents;
  }

  addEvent(newEvent) {
    this.#events.push(newEvent);
  }
}

class EventsController {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.init();
  }

  init() {
    this.setUpEvents();
    this.fetchEvents();
  }

  setUpEvents() {
    this.setUpCickEvent();
  }

  async fetchEvents() {
    const events = await eventsAPIs.getEvents();
    this.model.setEvents(events);
    this.view.renderEvents(events);
  }

  setUpCickEvent() {
    this.view.addEventButton.addEventListener("click", async () => {
      const newEventElement = document.createElement("tr");
      newEventElement.innerHTML = `<td><input class="new-event-name"></td><td><button class="save-new-event">Save</button></td>`;
      this.view.eventList.appendChild(newEventElement);

      const saveButton = newEventElement.querySelector(".save-new-event");
      saveButton.addEventListener("click", async () => {
        const inputElement = newEventElement.querySelector(".new-event-name");
        const eventName = inputElement.value.trim();
        if (!eventName) return;
        const newEvent = await eventsAPIs.addEvent({ eventName });
        this.model.addEvent(newEvent);
        this.view.renderNewEvent(newEvent);
        
      })
    })


  }
}

const eventsView = new EventsView();
const eventsModel = new EventsModel();
const eventController = new EventsController(eventsView, eventsModel);