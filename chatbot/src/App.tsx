import { useEffect, useRef, useState } from "react";
import "./App.css"; // Import custom styles
import avatar from  "./assets/avatar.png"; // Import image asset

function App() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "¡Hola! Soy tu asistente Virtual de Servicio Tecnico. Cuéntame ¿cual es tu nombre? " },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [currentStep, setCurrentStep] = useState("personName");
  const [responses, setResponses] = useState<string[]>([]);
  const messagesEndRef = useRef(null);
  const Hours : Record<number,string> = {1: "10 AM - 12 PM", 2: "12 PM - 2 PM", 3: "2 PM - 4 PM"};
  

  const predefinedOptions = {
    day: [
      "¿Qué día prefieres para la visita de nuestro personal de servicio técnico?",
      "Opciones: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado",
    ],
    dayConfirmation: ["El día seleccionado es {day}, ¿Es correcto?  por favor responde si o no."],
    hourConfirmation: ["La franja horaria seleccionada es {hour}, ¿Es correcto? por favor responde si o no."],
    addressConfirmation: ["La dirección ingresada es {address}, ¿Es correcto? por favor responde si o no."],
    identificationConfirmation: ["El número de documento ingresado es {id}, ¿Es correcto? por favor responde si o no."],
    hour: [
      "¡Perfecto! ¿Qué horario prefieres? Selecciona una franja horaria.",
      "Opciones: \n1. 10 AM - 12 PM\n2. 12 PM - 2 PM\n3. 2 PM - 4 PM",
    ],
    address: ["Excelente, por favor ingresa la dirección de tu hogar."],
    identification: ["¡Hola! {name} para verificar tu identidad por favor, ingrese su número de documento."],
    confirmation: ["Quieres programar la visita el dia " + responses[1] + " en la franja " + responses[2] + " en la dirección " + responses[3] + " ¿Es correcto? por favor responde si o no."],
    default: ["Lo siento, no entendí eso. Por favor, elige una opción válida."],
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleBotResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();

    switch (currentStep) {


      case "personName":
        setCurrentStep("identification");
        return predefinedOptions.identification.map(msg => msg.replace("{name}", lowerMessage));

      case "day":
        if (["lunes", "martes", "miércoles", "jueves", "viernes", "sábado"].some((day) => lowerMessage.includes(day))) {
          const selectedDay = lowerMessage.split(" ")[0]; 
          setCurrentStep("dayConfirmation");
          setResponses((prev) => [...prev, selectedDay]);
          return predefinedOptions.dayConfirmation.map(msg => msg.replace("{day}", selectedDay)); 
        }
        break;

      case "dayConfirmation":
        if (lowerMessage.includes("si")) {
          setCurrentStep("hour");
          return predefinedOptions.hour;
        } else if (lowerMessage.includes("no")) {
          setCurrentStep("day");
          return predefinedOptions.day;
        }
        break;

      case "hour":
        if (["1", "2", "3"].some((hour) => lowerMessage.includes(hour))) {

          const selectedHour = Hours.hasOwnProperty(lowerMessage) ? Hours[parseInt(lowerMessage)] : "Horario no disponible";
          
          // Guardar la opción seleccionada
          setCurrentStep("hourConfirmation");
          setResponses((prev) => [...prev, selectedHour]);
          console.log(responses);
          return predefinedOptions.hourConfirmation.map(msg => msg.replace("{hour}", selectedHour));
        }
        break;

      case "hourConfirmation":
        if (lowerMessage.includes("si")) {
          setCurrentStep("address");
          return predefinedOptions.address;
        } else if (lowerMessage.includes("no")) {
          setCurrentStep("hour");
          return predefinedOptions.hour;
        }
        break;

      case "address":
        if (lowerMessage.trim().length > 0) {
          const addressInput = lowerMessage; // Guardar la dirección ingresada
          setCurrentStep("addressConfirmation");
          setResponses((prev) => [...prev, addressInput]);
          return predefinedOptions.addressConfirmation.map(msg => msg.replace("{address}", addressInput));
        }
        break;

      case "addressConfirmation":
        if (lowerMessage.includes("si")) {
          setCurrentStep("confirmation");
          return predefinedOptions.confirmation;
        } else if (lowerMessage.includes("no")) {
          setCurrentStep("address");
          return predefinedOptions.address;
        }
        break;

      case "identification":
        if (/^\d+$/.test(lowerMessage)) { // Verifica si es un número válido
          const idInput = lowerMessage; // Guardar el número de identificación
          setCurrentStep("identificationConfirmation");
          setResponses((prev) => [...prev, idInput]);
          return predefinedOptions.identificationConfirmation.map(msg => msg.replace("{id}", idInput));
        }
        break;

      case "identificationConfirmation":
        if (lowerMessage.includes("si")) {
          setCurrentStep("day");
          return predefinedOptions.day;
        } else if (lowerMessage.includes("no")) {
          setCurrentStep("identification");
          return predefinedOptions.identification;
        }
        break;

      case "confirmation":
        if (lowerMessage.includes("si")) {
          setCurrentStep("end");
          return ["¡Perfecto! La visita ha sido programada con éxito. Gracias por usar nuestro servicio."];
        } else if (lowerMessage.includes("no")) {
          setCurrentStep("day");
          return predefinedOptions.day;
        }
        return [""];

      case "end":
        return [""];
      
      default:
        return predefinedOptions.default;
    }

    return predefinedOptions.default;
  };

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    // Agregar mensaje del usuario
    setMessages((prev) => [...prev, { sender: "user", text: newMessage }]);

    // Obtener respuesta del bot
    const botReplies = handleBotResponse(newMessage);

    // Simular un tiempo de respuesta del bot
    setTimeout(() => {
      botReplies.forEach((reply) => {
        setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      });
    }, 1000);

    setNewMessage("");
  };

 return (
    <div className="chatbot-app">
      <div className="chat-header">Asistente Virtual Servicio Tecnico</div>


      
      <div className="chat-messages">
      {messages.map((message, index) => (
    <div key={index} className={`chat-bubble ${message.sender === "user" ? "user-bubble" : "bot-bubble"}`}>
      {message.sender === "bot" && (
        <img src= {avatar} alt="Bot Avatar" className="bot-image" />
      )}
      <div className="message-content">
        {message.text}
      </div>
    </div>
  ))}
        <div ref={messagesEndRef} /> {/* Elemento para hacer scroll */}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          placeholder="Escribe tu mensaje aquí..."
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
}

export default App;
