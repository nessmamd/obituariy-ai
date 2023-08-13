import React, {useState, useEffect, useRef} from 'react';
import DeadList from './DeadList'; 
import { v4 as uuidv4 } from "uuid";

export default function Homepage(){
    const[editor, setEditor] = useState(false); 
    const[id, setID] = useState(uuidv4()); 
    const[name, setName] = useState(''); 
    const[birth, setBirth] = useState(''); 
    const[death, setDeath] = useState(''); 
    const[rips,setRIP] = useState(false); 
    const[def,setDef] = useState(true); 
    const[image, setImage] = useState(null);
    const [labelRef, setLabelRef] = useState(null);
    const [filename, setFilename] = useState("No Image Selected");

    //each array includes the information
    const[allDeaths, setAllDeaths] = useState([]); 

    async function fileSelectedHandler (event) {
        console.log(event.target.files[0])
        setImage(event.target.files[0])
        setFilename(event.target.files[0].name)
    };

    function newObituaryClick(){
        console.log("new "); 
        setEditor(true); 
        document.body.classList.add('transparent'); 
        var outerContainer = document.getElementsByClassName('outer');
        for(var index=0; index < outerContainer.length; index++){
            outerContainer[index].style.display = "flex";
        }

        var innerContainer = document.getElementsByClassName('inner');
        for(var index=0; index < innerContainer.length; index++){
            innerContainer[index].style.marginTop = "-690px";
        }
    }

    
    async function storing_data(data) {
        const res = await fetch(
            "https://rnsxumi4lhfemtmbsbqiqpmd7e0xnsgk.lambda-url.ca-central-1.on.aws/",
            {
                method: "POST",
                body: data,
            }
        );

        const resJson = await res.json();

        // if successful, you need to add a new death here
        const newItem = {id: resJson.deadID, voice: resJson.voice, deadName: resJson.deadName, deadBirth: resJson.deadBirth, deadDeath: resJson.deadDeath, imageDeath: resJson.imageDeath, description: resJson.description}
        setAllDeaths([ newItem, ...allDeaths]); 

        var deathArray = document.getElementsByClassName('outer');
        for(var index=0; index < deathArray.length; index++){
            deathArray[index].style.display = "none";
        }

        var innerContainer = document.getElementsByClassName('inner');
        for(var index=0; index < innerContainer.length; index++){
            innerContainer[index].style.marginTop = "0";
        }

        setName('');
        setBirth('');
        setDeath('');
        setImage(null);
        setFilename('');
      }

    function rip(){
        setRIP(true); 
        setEditor(false);
        setDef(false);
        var deathID = uuidv4();
        setID(deathID);
        console.log("ID: " + deathID);
        const labelText = labelRef ? labelRef.textContent : '';
        console.log("image name");
        console.log(typeof labelText); 

        //bismallah this should update everytime IT DOES 
        var description = "what chatgpt has to say about it yesir"
        
        const data = new FormData();
        data.append("file", image)
        data.append("name", name)
        data.append("birth", birth)
        data.append("death", death)
        data.append("id", id)
        
        storing_data(data); 
    }

    useEffect(() => {
        const retrive_bismallah = async () => {
            const res = await fetch(
                "https://jr7qp7ki5r7ccoia7upgxnaptq0qxvxk.lambda-url.ca-central-1.on.aws/",
                {
                  method: "GET",
                  headers: {
                    "Content-Type" : "application/json",
                  },
                }
              );
            const alldeaths = await res.json();
            if(alldeaths.message != 'empty table'){
                setRIP(true); 
                setDef(false); 
                const array = alldeaths.sort((a,b) => a.number - b.number); 
                setAllDeaths(array); 
            }
        };
        retrive_bismallah(); 
    }, []); 

    function outClick(){
        setEditor(false); 
        setName('');
        setBirth('');
        setDeath('');
        setImage(null);
        setFilename('');
        document.body.classList.remove('transparent');
        var deathArray = document.getElementsByClassName('outer');
        for(var index=0; index < deathArray.length; index++){
            deathArray[index].style.display = "none";
        }
        var innerContainer = document.getElementsByClassName('inner');
        for(var index=0; index < innerContainer.length; index++){
            innerContainer[index].style.marginTop = "0";
        }
    }

    return(
        
        <div className = "container">
            <div className = "outer">
                {editor && <div className = "creator">
                    <button className = "quiteditor" onClick = {outClick}> &times;</button>
                    <div className = "title">
                        <h1>Create a New Obituary</h1>
                        {/* {image && <img alt = "tatto" src = {image} />} */}
                        <img alt = "tatto" src = "https://media.discordapp.net/attachments/715996959655329943/1096303197057994753/Screen_Shot_2023-04-13_at_11.15.30_PM.png?width=668&height=200" />
                    </div>
                    <div className = "file-upload" id="file-upload">
                        <input className = "file-upload_input" type = "file" name = "myFile" id = "myFile" onChange={fileSelectedHandler}/>
                        <label id = "file-upload_placeholder" htmlFor='myFile'>Select an image for the deceased</label>
                        <span className='file-upload__label'>{filename}</span>
                    </div>
                    <div className = "upper">
                        <form>
                            <input className = "deadName" type="text" placeholder = "Name of the deceased" value={name} onChange={(e) => setName(e.target.value)}/>
                        </form>
                    </div>
                    <div className = "dates">
                        <h2>Born: </h2>
                        <input type="datetime-local" value = {birth} onChange = {(e) => setBirth(e.target.value)}  className = "dateed"/>
                        <h2>Died: </h2>
                        <input type="datetime-local" value = {death} onChange = {(e) => setDeath(e.target.value)} className = "dateed"/>
                    </div>
                    <div className = "khalas">
                        <button onClick = {rip} className = "creating" >Write Obituary</button>
                    </div> 
            </div>}
            </div>
            <div className = "inner">
                <div className="header">
                    <h1>The Last Show</h1>
                    <button onClick = {newObituaryClick}>&#x002B; New Obituary</button>
                </div>
                <div className = "deathsArray"> 
                    {def && <h1 className = "noID">No Obituary Yet. </h1>}
                    {/* this is where we create a new Dead person and their ID */}
                    {rips && <DeadList allDeaths = {allDeaths} />}
                    {/* {rips && <Dead name = {name} birth = {birth} death = {death} image = {image}/>} */}
                </div>
            </div>
        </div>

    );

}