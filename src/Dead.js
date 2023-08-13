import {React, useState, useRef} from 'react';

function Dead(props){
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audio = document.getElementById('audio-player');

    const togglePlay = () => {
        const audio = audioRef.current;
        if (audio.readyState === 4) {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                audio.play();
                setIsPlaying(true);
            }
        }
    }
    
    const [more, setMore] = useState(true); 
    const [name, setName] = useState('hey');
    function collapse(){
        setName(props.name); 
    }
    
    return(
        <>
        <div onClick={collapse} className="card"> 
            <img src={props.image} alt="No Image Available"/>
            <h2>{props.name}</h2>
            <p>{props.birth} - {props.death}</p>
            {more && <p>{props.description}</p>}
            <audio 
                ref={audioRef} 
                src={props.voice} 
                type="audio/mp3"
            />
            <div className="but" onClick={togglePlay}>
                <i className={`fa ${isPlaying ? 'fa-pause' : 'fa-play'}`} />
            </div>
        </div>
        </>
    )
    
} export default Dead; 