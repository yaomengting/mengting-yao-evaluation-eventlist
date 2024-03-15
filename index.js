const eventsAPIs = (function(){
  const API_URL = "http://localhost:3000/events";

  async function getEvents(){
    return fetch(API_URL).then((res) => res.json());
  }

  return {
    getEvents
  };

})();

class EventsView {
  constructor(){
    this.eventList = document.querySelector(".event-list");
  }

  renderEvents(events){
    this.eventList.innerHTML = "";
    events.forEach((event) => {
      this.renderNewEvent(event);
    })
  }

  renderNewEvent(newEvent){
    this.eventList.appendChild(this.createEventElement(newEvent));
  }

  createEventElement(event){
    const eventElement = document.createElement("tr");
    eventElement.classList.add("event");
    eventElement.setAttribute("id", event.id);
    eventElement.innerHTML = `<td><input value="${event.eventName}"></td>`;
    return eventElement;
  }
}

class EventsModel {
  #events;
  constructor(events = []){
    this.#events = events;
  }

  getEvents(){
    return this.#events;
  }

  setEvents(newEvents){
    this.#events = newEvents;
  }
}

class EventsController {
  constructor(view, model){
    this.view = view;
    this.model = model;
    this.init();
  }

  init(){
    this.fetchEvents();
  }

  async fetchEvents(){
    const events = await eventsAPIs.getEvents();
    this.model.setEvents(events);
    this.view.renderEvents(events);
  }
}

const eventsView = new EventsView();
const eventsModel = new EventsModel();
const eventController = new EventsController(eventsView, eventsModel);