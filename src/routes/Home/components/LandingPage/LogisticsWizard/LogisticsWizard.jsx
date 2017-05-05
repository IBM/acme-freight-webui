import React from 'react';
import Mockup from '../assets/img/mockup.png';
import classes from './LogisticsWizard.scss';

import { Card, CardMedia } from 'material-ui/Card';
import Diagram from '../assets/img/Architecture_Diagram.png';
// import Graph from '../assets/img/graph.svg';
// import classes from './ArchDiagram.scss';


export const LogisticsWizard = () => (
  <div>
    <div className={classes.logisticsWizard}>
      <section>
        <h1>Acme Freight</h1>
        <p>
          A cognitive logistics solution that analyzes real-time data, provides
          intelligent recommendations, and presents your employees with a beautiful
          monitoring dashboard to help lead your supply chain management system into the future.
        </p>
      </section>
      <section>
        <img src={Mockup} role="presentation" />
      </section>
    </div>
    <div className={classes.archDiagram}>
      <h1>Acme Freight Architecture</h1>
      <Card className={classes.diagram}>
        <CardMedia>
          <img src={Diagram} alt="Architecture Diagram" />
        </CardMedia>
      </Card>
    </div>
  </div>
);

export default LogisticsWizard;
