import React , {useEffect , useState , useContext , useRef} from 'react'
import qs from 'qs' ; 
import styles from './Chat.module.css' ; 
import io from 'socket.io-client' ; 
import ScrollToBottom from 'react-scroll-to-bottom'
let socket = io('localhost:1919') ; 
const Chat = () => {
    const [name , setName] = useState('') ; 
    const [isValidURL , setIsValidURL] = useState(false) ;
    const [people , setPeople] = useState([]) ; 
    const [roomName , setRoom] = useState('') ; 
    const [messages, setMessages] = useState([]) ;
    const inputRef = useRef() ; 
    useEffect(() => {
        console.log('I')
        //eslint-disable-next-line
    } , [location.href])

    useEffect(() => {
        let { name , room} = qs.parse(window.location.href , {
            ignoreQueryPrefix:true , 
        }) ; 
        if(!name || !room || name === "" || room === ""){
            setIsValidURL(false) ; 
        }
        else {
            setName(name) ; 
            setIsValidURL(true) ; 
            setRoom(room) ;
            document.title = `Room - ${room}`
            socket.emit('new' , [name , room]) ; 
            socket.on('room-info' , ppl => setPeople(ppl)) ; 
            socket.on('foreign-message' , ([msg , author]) =>{
                setMessages(prev => [...prev , {type:"msg" , className:"IncomingMessage" , children:msg , author:author}]) ; 
            }) ; 
            socket.on('new-user', ([user , ppl]) => {
                setPeople(ppl) ; 
                setMessages(prevMsgs => [...prevMsgs , {
                    bg:"lime" , 
                    type:"tooltip" , 
                    className:"tooltip" , 
                    children:`${user} has joined the chat.`
                }])
            }) ;
            socket.on('user-left' , ([name , ppl]) => {
                setPeople(ppl) ; 
                setMessages(prevMsgs => {
                    return [...prevMsgs , {type:"tooltip" , bg : "red" , children:`${name} has left the chat` }] ; 
                })
            })
        }
    } , []) ; 
    return (
        <React.Fragment>
            {isValidURL === false ? 
        ""
        :
        <div className={styles.page}>
            <div className={styles.info}>
                <div className={styles.logo}>
                    One Chat
                </div>
                <big>
                    Users in chat
                </big>
                <div className={styles.users__wrapper}>
                    {people.length > 0 && people.map(person => (<li key = {Math.random() * Math.random() - Math.random()} className = {styles.user}>{person}</li>))}
                </div>
            </div>
            <div className={styles.chat}>
                <div className={styles.room__info}>
                    <big className={styles.room__name}>Room - {roomName}</big>
                    <button className = {styles.leave} onClick = {() => {
                        window.location.assign('/') ; 
                        socket.emit('disconnect') ; 
                    }}>
                        Leave Room
                    </button>
                </div>
                    <ScrollToBottom className = {styles.main__chat}>
                {/* <div className={styles.main__chat} ref = {msgRef}> */}
                    {messages.length > 0 && messages.map(msg => {
                        return <Message styles = {styles} bg = {msg.bg} key = {Math.random()*Math.random()} className = {msg.className} type = {msg.type} author = {msg.author}>
                            {msg.children}
                        </Message>
                    })}
                {/* </div> */}
                    </ScrollToBottom>
                <div className={styles.message__box}>
                    <form className={styles.tired} 
                   
                    onSubmit = {(e) => { 
                        e.preventDefault() ;
                        if(inputRef.current.value === '' || inputRef.current.value.trim() === ''){
                            
                        }
                        else if(inputRef.current.value.length > 1000){
                            alert('Message length too big!')
                        }
                        else { 
                            let value = inputRef.current.value ; 
                            inputRef.current.value = '' ; 
                            socket.emit('message' , [roomName , value , name]) ; 
                            setMessages([...messages , {
                                type:"msg" , 
                                className : "OutgoingMessage" ,
                                children:value,
                                author:name , 
                            }]) ; 
                        }

                    }}
                    >
                        <input type="text" className={styles.message__input} ref = {inputRef} />
                        <button className={styles.send__msg} type = "submit"><i class="fas fa-paper-plane"></i></button>
                    </form>
                </div>
            </div>
            
        </div>  
        }
        </React.Fragment>
    )



}

export default Chat

function Message({type , bg , className , styles , children , author}) {
    if(type === 'msg'){
        if(className === 'OutgoingMessage'){
            return<div className = {styles.msg__wrapper}>
                <div className={styles.name}>{"You"}</div>
        <div className = {styles[className]}>{children}</div>
            </div>
    }
    else {
        return <div className = {styles['msg__wrapper']}>
        <div className={styles.name__for}>{author}</div>
    <div className = {styles[className]}>{children}</div>
    </div>
    }
    }
    else {
        return <div>
        <div className = {styles.tooltip} style = {{backgroundColor:bg}}>
            {children}
        </div>
        </div>
    }
}
