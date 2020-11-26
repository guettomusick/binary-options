import React, { useState } from 'react';
import NesContainer from '../shared/components/NesContainer';

import Aux from '../shared/hoc/Auxiliar';

const ConsultationForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [thanksMessage, setThanksMessage] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(name);
        console.log(email);
        console.log(message);
        setThanksMessage(true);
    }
    return (
        <Aux>
            <p style={{textDecoration: 'underline'}}>Request free consultation:</p>
            <NesContainer>
                <form onSubmit={handleSubmit}>
                    <label>Name</label>
                    <input type="text" 
                        value={name} 
                        required 
                        onChange={(e) => setName(e.target.value)} />
                    <label >Email</label>
                    <input type="email" 
                        value={email} 
                        required
                        onChange={(e) => setEmail(e.target.value)} />
                    <label>Message</label>
                    <input type="text" 
                        value={message} 
                        required
                        onChange={(e) => setMessage(e.target.value)} />
                    <input type="submit" value="Send" />
                </form>
            </NesContainer>
            {name && thanksMessage && <p style={{textAlign: 'center'}}>Thanks {name}!!!</p>}
        </Aux>
    );
}
 
export default ConsultationForm;