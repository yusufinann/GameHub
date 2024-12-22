import logo from './logo.svg';
import './App.css';
import {Button} from '@gamecenter/tombala-game'
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Editt <code>src/App.js</code> and save to reload.
        </p>
      <Button/>
      </header>
    </div>
  );
}

export default App;
