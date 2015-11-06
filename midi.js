;(function(global) {
  'use strict';

  function Midi() {}

  var inputSelect = null;
  var inputList;
  var outputSelect = null;
  var outputList;

  try {
    if (global.navigator.requestMIDIAccess) {
      global.navigator.requestMIDIAccess().then(function(midiAccess) {
        var inputCmb = global.document.getElementById('inputPort');
        var outputCmb = global.document.getElementById('outputPort');

        if (typeof midiAccess.inputs === "function") {
          inputList = midiAccess.inputs();
          for (var i = 0; i < inputList.length; i++) {
            var input = inputList[i];
            inputCmb.appendChild(new global.Option(input.manufacturer + ' ' + input.name, input.id ));
          }
          inputCmb.appendChild(new global.Option('NONE', -1));
          inputSelect = inputList.length > 0 ? inputList[0] : null;

          outputList = midiAccess.outputs();
          for (var i = 0; i < outputList.length; i++) {
            var output = outputList[i];
            outputCmb.appendChild(new global.Option(output.manufacturer + ' ' + output.name, output.id ));
          }
          outputCmb.appendChild(new global.Option('NONE', -1));
          outputSelect = outputList.length > 0 ? outputList[0] : null;
        } else {
          inputList = [];
          var inputItr = midiAccess.inputs.values();
          for (var input = inputItr.next(); !input.done; input = inputItr.next()) {
            var v = input.value;
            inputList[inputList.length] = v;
            inputCmb.appendChild(new global.Option(v.manufacturer + ' ' + v.name, v.id));
          }
          inputCmb.appendChild(new global.Option('NONE', -1));
          inputSelect = inputList.length > 0 ? inputList[0] : null;

          outputList = [];
          var outputItr = midiAccess.outputs.values();
          for (var output = outputItr.next(); !output.done; output = outputItr.next()) {
            var v = output.value;
            outputList.push(v);
            outputCmb.appendChild(new global.Option(v.manufacturer + ' ' + v.name, v.id));
          }
          outputCmb.appendChild(new global.Option('NONE', -1));
          outputSelect = outputList.length > 0 ? outputList[0] : null;
        }
      },
      function(msg) {
        global.alert('Failed to get MIDI access - ' + msg);
      });
    } else {
      global.alert('お使いのブラウザはWeb MIDI APIに対応していません。Web MIDI APIを有効化したChromeを使用してください。');
    }
  } catch (e) {
    global.console.log(e);
  }

  Midi.prototype.sendNote = function(data0, data1) {
    if (outputSelect) {
      try {
        outputSelect.send([data0, data1, 0x7f]);
        outputSelect.send([0x80, data1, 0x7f], global.performance.now() + 1000.0);
      } catch(e) {
        global.console.log(e);
      }
    }
  };

  Midi.prototype.changeInput = function() {
    function onmidimessage(event) {
      try {
        outputSelect.send(event);
      } catch(e) {
        global.console.log(e);
      }
    }
    var inputCmb = global.document.getElementById('inputPort');
    var selectIndex = inputCmb.selectedIndex;
    var inLength = inputList.length;

    inputSelect = null;
    for (var i = 0; i < inLength; i++) {
      var input = inputList[i];
      if (inputCmb.options[selectIndex].value === input.id) {
        inputSelect = input;
        inputSelect.onmidimessage = onmidimessage;
        break;
      }
    }
  };

  Midi.prototype.changeOutput = function() {
    var outputCmb = global.document.getElementById('outputPort');
    var selectIndex = outputCmb.selectedIndex;
    var outLength = outputList.length;

    outputSelect = null;
    for (var i = 0; i < outLength; i++) {
      var output = outputList[i];
      if (outputCmb.options[selectIndex].value === output.id) {
        outputSelect = output;
        break;
      }
    }
  };

  global.Midi = Midi;
})((this || 0).self || global);
