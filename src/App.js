import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
    //conig go here
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>chat app</h1>
        <SignOut  />
      </header>

      <section>
        {user ? <ChatRoom/> : <SignIn />}
      </section>

    </div>
  );
}


function SignIn() {
  const sighInWithGoogle = () =>{
   const provider= new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)    
  }
  return(
    <>
    <button className='sign-in' onClick={sighInWithGoogle}>sign in with google</button>
    </>
  )
  
}
function SignOut() {
  return auth.currentUser && (
    <button className='sign-out' onClick={()=>auth.signOut()}>sign out</button>
  )
  
}
function ChatRoom() {
  const dummy = useRef();
  //define the collection to use in the Data Base
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25);
  //query the data from the data base for the messages
  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setformValue]=useState('')
  // used an async function to sent data to the data base
  const sendMessage = async(e) =>{
    e.preventDefault();

    const {uid, photoURL} = auth.currentUser;
    //uses the .add() to take a js object and send it to the data base
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setformValue(''); 
    //dummy.current.scrollIntoView({behavior:'smooth'});
  }
  return(
    <>
      <main>
        {messages && messages.map(msg=> <ChatMessage key={msg.id} message={msg}/>)}

        <div Ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        {/* used the setformValue to update the message with the useState hook*/ }
        <input value={formValue} onChange={(e)=>setformValue(e.target.value)} placeholder="type here" />

        <button type='submit' disabled={!formValue}>send</button>

      </form>


    </>
  )
  
}
function ChatMessage(props) {
  const {text, uid, photoURL} = props.message;

  const messageClass= uid ===auth.currentUser.uid ? 'sent':'recived'
  return(
    <>
      <div className={`message ${messageClass}`}>
          <img src={photoURL} />
          <p>{text}</p>
      </div>
    </>
  )

}

export default App;