import React from 'react';
import GhostButton from 'components/GhostButton';
import classes from './Footer.scss';

export const Footer = () => (
  <div className={classes.footer}>
    <div className={classes.gradient} />
    <h4>Learn more on the Acme Freight GitHub</h4>
    <a href="https://github.com/ibm/acme-freight">
      <GhostButton label="Acme Freight GitHub" />
    </a>
  </div>
);

export default Footer;
