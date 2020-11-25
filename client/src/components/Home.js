import React from 'react'

import BuySell from './BuySell';
import Place from './Place';
import Collect from './Collect';
import NesDialog from '../shared/components/NesDialog';
import NesBalloonSection from '../shared/components/NesBalloonSection';
import NesBalloon from '../shared/components/NesBalloon';
import NesContainer from '../shared/components/NesContainer';

const Home = () => {
    return ( 
        <NesContainer>
            <NesBalloonSection>
              <NesBalloon left>BIN Token is an ETH backed coin, BIN supply is governed only by binary options payments.</NesBalloon>
              <NesBalloon right>Tokens will be minted in case winner options cannot be payed, and will be burned if BIN contract balance increase.</NesBalloon>
            </NesBalloonSection>
            <BuySell/>
            <Place />
            <Collect />
            <NesDialog rounded/>
        </NesContainer>
    );
}
 
export default Home;