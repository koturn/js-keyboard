var midi = null;  // グローバルMIDIAccessオブジェクト
var inputSelect = null;
var inputList = null;
var outputSelect = null;
var outputList = null;

try {
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({sysex: false}).then(function(midiAccess) {
      midi = midiAccess;

      var inputCmb = document.getElementById('inputPort');
      inputList = midi.inputs();
      for (var i = 0; i < inputList.length; i++) {
        var input = inputList[i];
        inputCmb.appendChild(new Option(input.manufacturer + ' ' + input.name, input.id ));
      }
      inputCmb.appendChild(new Option('NONE', -1));

      var outputCmb = document.getElementById('outputPort');
      outputList = midi.outputs();
      for ( var i = 0; i < outputList.length; i++ ) {
        var output = outputList[i];
        outputCmb.appendChild(new Option(output.manufacturer + ' ' + output.name, output.id ));
      }
      outputCmb.appendChild(new Option('NONE', -1));

      if (inputList.length > 0) changeInput();
      if (outputList.length > 0) changeOutput();
    },
    function(msg) {
      alert('Failed to get MIDI access - ' + msg );
    });
  } else {
    alert('お使いのブラウザはWeb MIDI APIに対応していません。Web MIDI APIを有効化したChromeを使用してください。');
  }
} catch (e) {
  console.log(e);
}


function echoMIDIMessage(event) {
  if (outputSelect) {
    try {
      outputSelect.send(event.data);
    } catch (e) {
      console.log(e);
    }
  }
}


function echoMIDIMessage2(data0, data1) {
  if (outputSelect) {
    try {
      outputSelect.send([data0, data1, 0x7f]);
      outputSelect.send([0x80, data1, 0x7f], performance.now() + 1000.0);
    } catch(e) {
      console.log(e);
    }
  }
}


function changeInput() {
  var inputCmb = document.getElementById('inputPort');
  var selectIndex = inputCmb.selectedIndex;
  var inLength = inputList.length;

  inputSelect = null;
  input.onmidimessage = null;
  for (var i = 0; i < inLength; i++) {
    var input = inputList[i];
    if (inputCmb.options[selectIndex].value == input.id) {
      inputSelect = input;
      inputSelect.onmidimessage = echoMIDIMessage;
      break;
    }
  }
}


function changeOutput() {
  var outputCmb = document.getElementById('outputPort');
  var selectIndex = outputCmb.selectedIndex;
  var outLength = outputList.length;

  outputSelect = null;
  for (var i = 0; i < outLength; i++) {
    var output = outputList[i];
    if  (outputCmb.options[selectIndex].value == output.id) {
      outputSelect = output;
      break;
    }
  }
}
