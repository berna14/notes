import { useState, useEffect } from "react";
import "./App.css";
import Note from "./Components/Note";
import axios from "axios";
import noteService from "./services/notes";
import Notification from "./Components/Notification";

const App = () => {
  const [notas, setNotas] = useState([]);
  const [newNota, setNewNota] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState();

  useEffect(() => {
    noteService.getAll().then((initialNotes) => {
      setNotas(initialNotes);
    });
  }, []);

  const addNote = (event) => {
    event.preventDefault();
    const noteObject = {
      content: newNota,
      date: new Date().toISOString(),
      important: Math.random() < 0.5,
      id: notas.length + 1,
    };

    noteService.create(noteObject).then((returnedNote) => {
      setNotas(notas.concat(returnedNote));
      setNewNota("");
    });

    setNotas(notas.concat(noteObject));
    setNewNota("");
  };

  const handleNoteChange = (event) => {
    setNewNota(event.target.value);
  };

  const notesToShow = showAll
    ? notas
    : notas.filter((nota) => nota.important === true);

  const toggleImportanceOf = (id) => {
    const url = `http://localhost:3001/notes/${id}`;
    const note = notas.find((n) => n.id === id);
    const changedNote = { ...note, important: !note.important };

    noteService
      .update(id, changedNote)
      .then((returnedNote) => {
        setNotas(notas.map((nota) => (nota.id !== id ? nota : returnedNote)));
      })
      .catch((error) => {
        setErrorMessage(
          `Note '${note.content}' was already removed from server`
        );
        setTimeout(() => {
          setErrorMessage(null);
        }, 2000);
        setNotas(notas.filter((n) => n.id !== id));
      });
  };

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? "important" : "all"}
        </button>
      </div>
      <ul>
        {notesToShow.map((note, i) => (
          <Note
            key={i}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
        ))}
      </ul>
      <form onSubmit={addNote}>
        <input value={newNota} onChange={handleNoteChange} />
        <button type="submit">save</button>
      </form>
    </div>
  );
};

export default App;
