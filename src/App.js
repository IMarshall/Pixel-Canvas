import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import ReactSlider from "react-slider";
import { IconContext } from 'react-icons';
import {BsDropletHalf, BsBorder} from 'react-icons/bs';
import {GoPaintcan} from 'react-icons/go';

let currentColor = "z";
var currentInput = "dot";
let changedRow = Array(columnsCount).fill(null);
let changedSquare = null;

var r = document.querySelector(':root');

var columnsCount = 10;
var rowsCount = 10;

//1 - Add functions to convert canvas matrix to a string and string back to a matrix. First 4 characters represent how large canvas should be. Shorten the canvas matrix if needed.
//2 - Add in history with undo/redo functions
//3 - Fix sliders so that they're children of the canvas class. Restructure so that sliders change the state of the canvas matrix, adding or deleting rows/columns as needed. This will allow slider changes to be logged in history and undone/redone.
//4 - Add other drawing functions such as drawing lines, paintbrush, etc.
//5 - fix error when trying to fill an area with the already existing color

function App() {
  useEffect(() => {
    let blackSwatch = document.getElementsByClassName("z swatch");

    for (let i=0;i<blackSwatch.length;i++){
      blackSwatch[i].classList.add("active-swatch");
    }

    let dotInput = document.getElementsByClassName("dot input");

    for (let i=0;i<dotInput.length;i++){
      dotInput[i].classList.add("active-input");
    }

    let borderStyle = document.getElementsByClassName("border style");

    for (let i=0;i<borderStyle.length;i++){
      borderStyle[i].classList.add("active-border");
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pixel Canvas</h1>
        <div className='sliderContainer'>
          {Slider("Columns")}
          {Slider("Rows")}
        </div>
        <Canvas id="canvas"/>
        {/* <textarea id='textBox' rows='8'></textarea> */}
        <div className='buttonContainer'>
          <div className='styleButtonContainer'>
            <StyleButton styleButtonType='border'></StyleButton>
          </div>
          <div className='swatchContainer'>
            <Color className="square" color="z"></Color>
            <Color className="square" color="w"></Color>
            <Color className="square" color="r"></Color>
            <Color className="square" color="o"></Color>
            <Color className="square" color="y"></Color>
            <Color className="square" color="g"></Color>
            <Color className="square" color="b"></Color>
            <Color className="square" color="i"></Color>
            <Color className="square" color="v"></Color>
          </div>
          <div className='inputContainer'>
            <Input inputType="dot"></Input>
            <Input inputType="fill"></Input>
          </div>
        </div>
      </header>
    </div>
  );
}

class Square extends React.Component {
  render() {
    return (
      <button className={[this.props.color, 'square'].join(' ')}
      onClick= {() => this.props.onClick()}></button>
    )
  }
}

class Row extends React.Component {
  handleClick(i){
    changedSquare = i;
    this.props.onClick();
  }

  render() {
    const row = [];
  
    for (let i=0; i<columnsCount ;i++){
        row.push(<Square color={this.props.values[i]} 
          onClick={() => this.handleClick(i)}/>);
    }
    if(this.props.firstRow==true){
      return (
        <div className='row' id='row1'>{row}</div>
      )
    }
    else{
      return (
        <div className='row'>{row}</div>
      )
    }
  }
}

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      canvas: Array(50).fill(Array(50).fill('n')),
    }
  }

  fillRow(canvas, row, square, previousColor){
    const thisRow = canvas[row].slice();
    let changedSquares = [];
    //fill to the left
    for (let s=square; s>=0; s--){
      if(thisRow[s]==previousColor){
        thisRow[s] = currentColor;
        changedSquares.push(s);
      }
      else{
        break;
      }
    }
    //fill to the right
    for (let s=square+1; s<=columnsCount-1; s++){
      if(thisRow[s]==previousColor){
        thisRow[s] = currentColor;
        changedSquares.push(s);
      }
      else{
        break;
      }
    }
    canvas[row] = thisRow;

    if(row>0){
      this.checkAbove(canvas, row, changedSquares, previousColor);
      // catch(e){
      //   console.log(e.name);
      //   console.log(e.message);
      //   this.render();
      // }
    }

    if(row<rowsCount-1){
      this.checkBelow(canvas, row, changedSquares, previousColor);
      // catch(e){
      //   console.log(e.name);
      //   console.log(e.message);
      // }
    }
    return(canvas);
  }

  checkAbove(canvas, row, changedSquares, previousColor){
    let rowAbove = row-1;
    for(let i=0; i<changedSquares.length; i++){
      let square = changedSquares[i];
      if(canvas[rowAbove][square] == previousColor){
        this.fillRow(canvas, rowAbove, square, previousColor);
      }
    }
  }

  checkBelow(canvas, row, changedSquares, previousColor){
    let rowBelow = row+1;
    for(let i=0; i<changedSquares.length; i++){
      let square = changedSquares[i];
      if(canvas[rowBelow][square] == previousColor){
        this.fillRow(canvas, rowBelow, square, previousColor);
      }
    }
  }

  handleClick(i){
    let rows = this.state.canvas.slice();
    var squares = rows[i].slice();
    let previousColor = squares[changedSquare];
    
    //change clicked square color
    switch(currentInput){
      case "dot":
        squares[changedSquare] = currentColor;
        rows[i] = squares;
        break;
      case "fill":
        this.fillRow(rows, i, changedSquare, previousColor);
        break;
    }

    //record changed in canvas matrix
    this.setState({canvas: rows});
    this.generateString(rows);
  }

  generateString(canvasArray){
    const stringArray = [columnsCount, rowsCount];
    let textBox = document.getElementById('textBox');

    for(let r=0; r<rowsCount; r++){
      for(let s=0; s<columnsCount; s++){
        stringArray.push(canvasArray[r][s]);
      }
    }

    textBox.innerHTML = stringArray.join('');
  }

  render() {
    const canvas = [];
  
    for (let i=0; i<rowsCount ;i++){
      if(i==0){
        canvas.push(<Row values={this.state.canvas[i]} onClick={() => this.handleClick(i)} firstRow={true}/>);
        
      }
      else{
        canvas.push(<Row values={this.state.canvas[i]} onClick={() => this.handleClick(i)}/>);
      }
    }

    return (
      <div className='canvas'>{canvas}</div>
    )
  }
}

class Color extends React.Component {

  changeCurrentColor(color) {
    //remove active-swatch class from old swatch
    let swatch1 = document.getElementsByClassName("active-swatch");
    for (let i=0;i<swatch1.length;i++){
      swatch1[i].classList.toggle("active-swatch");
    }

    //set new color to variables
    currentColor=color;
    switch(currentColor){
      case "z":
        r.style.setProperty('--current', "black");
        break;
      case "w":
        r.style.setProperty('--current', "white");
        break;
      case "r":
        r.style.setProperty('--current', "red");
        break;
      case "o":
        r.style.setProperty('--current', "orange");
        break;
      case "y":
        r.style.setProperty('--current', "yellow");
        break;
      case "g":
        r.style.setProperty('--current', "green");
        break;
      case "b":
        r.style.setProperty('--current', "blue");
        break;
      case "i":
        r.style.setProperty('--current', "indigo");
        break;
      case "v":
        r.style.setProperty('--current', "violet");
        break;
    }
    

    //add active-swatch class to new swatch
    let swatch2 = document.getElementsByClassName(color + " swatch");
    for (let i=0;i<swatch2.length;i++){
      swatch2[i].classList.toggle("active-swatch");
    }
  }

  render() {
    return (
      <button className={[this.props.color, 'swatch', 'button'].join(' ')} onClick= {() => this.changeCurrentColor(this.props.color)}></button>
    )
  }
}

class Input extends React.Component {
  changeCurrentInput(inputType){
    //remove active-input class from old swatch
    let input1 = document.getElementsByClassName("active-input");
    for (let i=0;i<input1.length;i++){
      input1[i].classList.toggle("active-input");
    }

    currentInput = inputType;

    //add active-input class to new swatch
    let input2 = document.getElementsByClassName(inputType + " input");
    for (let i=0;i<input2.length;i++){
      input2[i].classList.toggle("active-input");
    }
  }

  render() {
    var icon;

    switch(this.props.inputType){
      case "dot":
        icon = <BsDropletHalf/>;
        break;
      case "fill":
        icon = <GoPaintcan/>;
        break;
    }

    return (
      <button className={[this.props.inputType, 'input', 'button'].join(' ')} 
        onClick = {() => this.changeCurrentInput(this.props.inputType)}>
        <IconContext.Provider value={{ className: 'react-icons' }}>{icon}</IconContext.Provider>
      </button>
    )
  }
}

class StyleButton extends React.Component {
  styleButtonFunction(styleButtonType){
    //add/remove active-swatch class from old swatch
    let borderButton = document.getElementsByClassName("border style");
    for (let i=0;i<borderButton.length;i++){
      borderButton[i].classList.toggle("active-border");
      if(borderButton[i].classList.contains("active-border")){
        r.style.setProperty('--square-border', "1px solid white");
      }
      else{
        r.style.setProperty('--square-border', "none");
      }
    }
  }

  render() {
    var icon;

    switch(this.props.styleButtonType){
      case "border":
        icon = <BsBorder/>;
        break;
    }

    return (
      <button className={[this.props.styleButtonType, 'style', 'button'].join(' ')} 
        onClick = {() => this.styleButtonFunction(this.props.styleButtonType)}>
        <IconContext.Provider value={{ className: 'react-icons' }}>{icon}</IconContext.Provider>
      </button>
    )
  }
}

function Slider(header) {
  const [currentValue, setCurrentValue] = useState(10);

  return (
    <div className='slider'>
      <h3>{header}: {currentValue}</h3>
      <ReactSlider
        className='horizontal-slider'
        min={4}
        max={30}
        thumbClassName='example-thumb'
        trackClassName='example-track'
        value={currentValue}
        onChange={(value) => {
          setCurrentValue(value);
          if(header=="Columns"){
            columnsCount = value;
          }
          else{
            rowsCount = value;
          }
        } } />
      </div>
  );
};



export default App;