import Dead from './Dead';

function AllDeath(props){
    return (
        <><h1> hey guys</h1><div className='deaths'>
            {props.deaddd.map((Death) => <Dead />)}
        </div></>
    );
} export default AllDeath;