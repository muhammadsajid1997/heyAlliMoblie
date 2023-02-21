import * as React from "react";
import {
  Text,
  StyleSheet,
  View,
  Button,
  ActivityIndicator,
  Image,
  TouchableHighlight,
} from "react-native";
import { Audio } from "expo-av";
import FormData from "form-data";
import axios from "axios";
import Mode from "./Mode";
import TranscribedOutput from "./TranscribeOutput";
// import RNPickerSelect from "react-native-picker-select";
import logo from './Images/homeLogo.jpg'
import * as Speech from 'expo-speech';

import { FontAwesome } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
// import logo from './Images/heyAllilogo.jpg'
import Voice, {
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@react-native-voice/voice";
import Record from "./Record";
import Messaging from "./Messaging";
import Myapp from "./Rating";
import Home from "./Home";
import { ScrollView } from "react-native-gesture-handler";
export default () => {

  const [speechText, setSpeechText] = React.useState("")
  const [recording, setRecording] = React.useState(false as any);
  const [recordings, setRecordings] = React.useState([]);
  const [message, setMessage] = React.useState("");
  const [transcribedData, setTranscribedData] = React.useState([] as any);
  const [interimTranscribedData] = React.useState("");
  const [isRecording, setIsRecording] = React.useState(false);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState("english");
  const [selectedModel, setSelectedModel] = React.useState(1);
  const [transcribeTimeout, setTranscribeTimout] = React.useState(5);
  const [started, setStarted] = React.useState(false)
  const [sound, setSound] = React.useState(null)
  const [stopTranscriptionSession, setStopTranscriptionSession] =
    React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false)
  const intervalRef: any = React.useRef(null);



  const stopTranscriptionSessionRef = React.useRef(stopTranscriptionSession);
  stopTranscriptionSessionRef.current = stopTranscriptionSession;

  const selectedLangRef = React.useRef(selectedLanguage);
  selectedLangRef.current = selectedLanguage;

  const selectedModelRef = React.useRef(selectedModel);
  selectedModelRef.current = selectedModel;


  const triggerWords = ["hey alli", "connect", "what's up alli", "Alli", "hi"]
  // React.useEffect(()=>{

  //   console.log("test"+speechText)
  //   if(triggerWords.find(item=>item==speechText)){
  //     speak("hi boss , how are you ?")
  //   }

  // },[speechText])
  async function playSound(url) {


    ;


    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync({ uri: url })
      ;
    setSound(sound);

    console.log('Playing Sound');
    console.log(new Date())

    await sound.playAsync();
  }


  const speak = (thingToSay) => {

    Speech.speak(thingToSay);
  };

  const supportedLanguages = [
    "english",
    "chinese",
    "german",
    "spanish",
    "russian",
    "korean",
    "french",
    "japanese",
    "portuguese",
    "turkish",
    "polish",
    "catalan",
    "dutch",
    "arabic",
    "swedish",
    "italian",
    "indonesian",
    "hindi",
    "finnish",
    "vietnamese",
    "hebrew",
    "ukrainian",
    "greek",
    "malay",
    "czech",
    "romanian",
    "danish",
    "hungarian",
    "tamil",
    "norwegian",
    "thai",
    "urdu",
    "croatian",
    "bulgarian",
    "lithuanian",
    "latin",
    "maori",
    "malayalam",
    "welsh",
    "slovak",
    "telugu",
    "persian",
    "latvian",
    "bengali",
    "serbian",
    "azerbaijani",
    "slovenian",
    "kannada",
    "estonian",
    "macedonian",
    "breton",
    "basque",
    "icelandic",
    "armenian",
    "nepali",
    "mongolian",
    "bosnian",
    "kazakh",
    "albanian",
    "swahili",
    "galician",
    "marathi",
    "punjabi",
    "sinhala",
    "khmer",
    "shona",
    "yoruba",
    "somali",
    "afrikaans",
    "occitan",
    "georgian",
    "belarusian",
    "tajik",
    "sindhi",
    "gujarati",
    "amharic",
    "yiddish",
    "lao",
    "uzbek",
    "faroese",
    "haitian creole",
    "pashto",
    "turkmen",
    "nynorsk",
    "maltese",
    "sanskrit",
    "luxembourgish",
    "myanmar",
    "tibetan",
    "tagalog",
    "malagasy",
    "assamese",
    "tatar",
    "hawaiian",
    "lingala",
    "hausa",
    "bashkir",
    "javanese",
    "sundanese",
  ];



  const [modelOptions, setModelOptions] = React.useState(["tiny", "base", "small", "medium", "large"]);
  React.useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  async function startRecording() {
    try {
      setStarted(true)
      console.log("Requesting permissions..");
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        // alert("Starting recording..");
        const RECORDING_OPTIONS_PRESET_HIGH_QUALITY: any = {
          android: {
            extension: ".wav",
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_NB,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: ".wav",
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        };
        const { recording }: any = await Audio.Recording.createAsync(
          RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
        console.log("Recording started");
        setStopTranscriptionSession(false);
        setIsRecording(true);
        intervalRef.current = setInterval(
          transcribeInterim,
          transcribeTimeout * 1000
        );
        console.log("erer", recording);
      } else {
        setMessage("Please grant permission to app to access microphone");
      }
    } catch (err) {
      console.error(" Failed to start recording", err);
    }
  }

  async function stopRecording() {
    setStarted(false)
    console.log("Stopping recording..");
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    let updatedRecordings = [...recordings] as any;
    const { sound, status } = await recording.createNewLoadedSoundAsync();
    updatedRecordings.push({
      sound: sound,
      duration: getDurationFormatted(status.durationMillis),
      file: recording.getURI(),
    });
    setRecordings(updatedRecordings);
    console.log("Recording stopped and stored at", uri);
    // Fetch audio binary blob data
    const filetype = uri.split(".").pop();
    const filename = uri.split("/").pop();
    console.log({
      uri,
      type: `audio/${filetype}`,
      name: filename,
    })
    const soundTest = new Audio.Sound();

    try {
      await soundTest.loadAsync({
        uri
      });
      await sound.playAsync();
    } catch (error) {
      alert("error")
    }
    setLoading(true);
    const formData = new FormData();
    // formData.append("language", selectedLangRef.current);
    // formData.append("model_size", modelOptions[selectedModelRef.current]);
    formData.append(
      "speech",
      {
        "uri":uri,
        type: `audio/${filetype}`,
        name: filename,
      }
    );
    console.log(formData)
    const url = 'https://heyalli.azurewebsites.net/api/HeyAlli';
    axios({
      method: 'get',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        // handle successful response
        console.log(response.data);
      })

    // axios({
    //   url: "https://heyalli.azurewebsites.net/api/HeyAlli",
    //   method: "GET",
    //   data: formData,
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "multipart/form-data",
    //   },
    // })
    //   .then(async function (response) {
    //     console.log("response :", response);
    //     playSound(res.data.result.url)



    //     // setTranscribedData((oldData: any) => [...oldData, response.data]);
    //     // setLoading(false);
    //     // setIsTranscribing(false);
    //     // intervalRef.current = setInterval(
    //     //   transcribeInterim,
    //     //   transcribeTimeout * 1000
    //     // );
    //   })
    //   .catch(function (error) {
    //     console.log("error :"+error);
    //   });

    if (!stopTranscriptionSessionRef.current) {
      setIsRecording(true);
    }

    clearInterval(intervalRef.current);
    setStopTranscriptionSession(true);
    setIsRecording(false);
    setIsTranscribing(false);
  }

  function getDurationFormatted(millis: any) {
    const minutes = millis / 1000 / 60;
    const minutesDisplay = Math.floor(minutes);
    const seconds = Math.round(minutes - minutesDisplay) * 60;
    const secondDisplay = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutesDisplay}:${secondDisplay}`;
  }

  function getRecordingLines() {
    return recordings.map((recordingLine: any, index) => {
      return (
        <View key={index} style={styles.row}>
          <Text style={styles.fill}>
            {" "}
            Recording {index + 1} - {recordingLine.duration}
          </Text>
          <Button
            style={styles.button}
            onPress={() => recordingLine.sound.replayAsync()}
            title="Play"
          ></Button>
        </View>
      );
    });
  }

  function transcribeInterim() {
    clearInterval(intervalRef.current);
    setIsRecording(false);
  }

  async function transcribeRecording() {
    const uri = recording.getURI();

  }

  function handleTranscribeTimeoutChange(newTimeout: any) {
    setTranscribeTimout(newTimeout);
  }


  return (
    <View style={styles.root}>
      <View style={{ alignSelf: 'flex-end', margin: 30, backgroundColor: 'black', padding: 1 }}>
        <Text style={{ color: 'white' }}>
          CC
        </Text>
      </View>
      <View style={{ flex: 1, marginHorizontal: 20, alignItems: 'center' }}>
        {speechText == "" &&
          <View>
            <Text style={styles.title}>Start Speaking </Text>
            <Text style={styles.title}> To Activate Alli </Text>
          </View>
        }
<ScrollView>
        <Text style={styles.title}>{speechText}</Text>
        </ScrollView>
      </View>
      <View style={styles.settingsSection}>

        <Image style={{ borderRadius: 80 }} source={logo} />
        {/* <Mode
              disabled={isTranscribing || isRecording}
              possibleLanguages={supportedLanguages}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              modelOptions={modelOptions}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              transcribeTimeout={transcribeTimeout}
              onTranscribeTiemoutChanged={handleTranscribeTimeoutChange}
              open={open}
              setOpen={setOpen}
              setModelOptions={setModelOptions}

            /> */}

      </View>
      <View style={styles.buttonsSection}>

        {/* {!isRecording && !isTranscribing && (
          <Button onPress={startRecording} title="Start recording" />
        )}
        {(isRecording || isTranscribing) && (
          <Button
            onPress={stopRecording}
            disabled={stopTranscriptionSessionRef.current}
            title="stop recording"
          />
        )} */}
        {/* <Button title="Transcribe" onPress={() => transcribeRecording()} /> */}
        {/* {getRecordingLines()}
          </View>
    
<View >
{/* {started ? (

          <TouchableHighlight                 disabled={stopTranscriptionSessionRef.current}
          onPress={stopRecording}>
            <View
              style={{
                width: 75,
                height: 75,
                borderRadius: 75,
                backgroundColor: "#0073ea",
                alignItems: "center",
                justifyContent: "center",
              }}
              // onPress={this._startRecognizing}
            >
              {[...Array(3).keys()].map((index) => {
                return (
                  <MotiView
                    from={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 4 }}
                    transition={{
                      type: "timing",
                      duration: 2000,
                      easing: Easing.out(Easing.ease),
                      delay: index * 200,
                      repeatReverse: false,
                      loop: true,
                    }}
                    key={index}
                    style={[
                      StyleSheet.absoluteFillObject,
                      { backgroundColor: "#0073ea", borderRadius: 75 },
                    ]}
                  />
                );
              })}
              <FontAwesome name="microphone-slash" size={24} color="#fff" />
            </View>
          </TouchableHighlight>
        ) : (
          <TouchableHighlight onPress={startRecording}  >
            <View
              style={{
                width: 75,
                height: 75,
                borderRadius: 75,
                backgroundColor: "#0073ea",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome name="microphone" size={24} color="#fff" />
            </View>
          </TouchableHighlight>
        )} */}
        <Home  changeText={(value)=>{
                    setSpeechText(value)
                }}/>
      </View>
      
      <View >

      </View>

      {getRecordingLines()}

      {/* {isLoading !== false ? (
            <ActivityIndicator
              size="large"
              color="#00ff00"
              hidesWhenStopped={true}
              animating={true}
            />
          ) : (
            <Text></Text>
          )}
    
          <View style={styles.transcription}>
            <TranscribedOutput
              transcribedText={transcribedData}
              interimTranscribedText={interimTranscribedData}
            />
          </View>

          <Record
          onSpeechEnd={(value) => {
          console.log(new Date())
            setSpeechText(value[0]);
            // getWave(value[0])
            // console.log("test"+value[0])
            // if(triggerWords.find(item=>item==value[0])){
            //   speak("hi boss , how are you ?")
            // }


          }}

          
          onSpeechStart={() => {
            // setSpeechText(" ");
            console.log("starting")
          }}
        /> */}
      {/* <Myapp/> */}
      {/* <Messaging /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    textAlign: "center",
    flexDirection: "column",
  },
  title: {
    marginTop: 0,
    fontWeight: "400",
    fontSize: 30,
    alignSelf: 'center',
    justifyContent: 'center'
  },
  settingsSection: {
    flex: 1,
  },
  buttonsSection: {

    flex: 1,
    flexDirection: "row",
  },
  transcription: {
    flex: 1,
    flexDirection: "row",
  },
  recordIllustration: {
    width: 100,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 50
  },
  fill: {
    flex: 1,
    margin: 16,
  },
  button: {
    margin: 5,
  },
});

const customPickerStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "blue",
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});