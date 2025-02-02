import * as shootUtils from 'shoot'

Hooks.on("init", function() {
  console.log("Setting up Gurps Game Aid Helpers")
  window.ShooterUtils = shootUtils

})

Hooks.on("ready", function() {
  console.log("This thing is ready to go...");
});
