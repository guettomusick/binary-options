import React from 'react'

import NesBalloonSection from '../shared/components/NesBalloonSection';
import NesBalloon from '../shared/components/NesBalloon';
import NesContainer from '../shared/components/NesContainer';

const About = () => {
    return ( 
        <NesContainer>
              <p style={{textDecoration: 'underline'}}>About</p>
              <NesBalloonSection>
                <NesBalloon left>A binary option is a financial product where the buyer receives a payout or loses their investment based on whether the option expires in the money.</NesBalloon>
                <NesBalloon right>Binary options depend on the outcome of a "yes or no" proposition, hence the name "binary." Binary options have an expiry date and/or time, in our case we have both.</NesBalloon>
              </NesBalloonSection>
        </NesContainer>
     );
}
 
export default About;