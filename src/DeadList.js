import Dead from './Dead'; 
function DeadList({allDeaths}){
    localStorage.setItem('Deaths', JSON.stringify(allDeaths));
  
  return(
      <>
          {allDeaths.map((dead) => (
              <Dead key = {dead.id} name = {dead.deadName} birth = {dead.deadBirth} death = {dead.deadDeath} image = {dead.imageDeath} description = {dead.description} voice={dead.voice}/>   
          ))}
      </>
      
  )
}
export default DeadList; 