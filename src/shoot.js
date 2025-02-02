export const getFirstTarget = () => Array.from(game.user.targets)[0]

export const getNonThrownRangedWeapons = (actor) => {
  return Object.values(actor.system.ranged).filter(w => w.mode !== "Thrown")
}

export const getRangePenalty = (actorToken, targetToken) => {
  const rangeTable = GURPS.rangeObject.ranges
  const range = canvas.grid.measurePath([actorToken, targetToken]).cost
  let rangePenalty = 0
  for (let i = 1; i < rangeTable.length; i++) {
    let rangeMax = rangeTable[i].max
    if (rangeMax < range)
      continue
    rangePenalty = rangeTable[i].penalty
    break
  }

  return rangePenalty
}

export const setUpAmmoTrackers = async (actor, weapons) => {
  for (let i = 0; i < weapons.length; i++) {
    const w = weapons[i];
    const trackerProps ={
      name: `${w.name} Ammo`,
      value: 0,
      min: 0,
      max: parseShots(w.shots),
      points: 0,
      thresholds: [],
      isMinimumEnforced: true,
      isMaximumEnforced: true,
      alias: "",
      pdf: "",
      isDamageTracker: false,
      isDamageType: false,
      initialValue: "",
      breakpoints: true
    } 

    const tracker = GURPS.findTracker(actor.system, trackerProps.name)
    if (!tracker) {
      let data = addTrackerToDataObject(actor.system, trackerProps)

      await actor.update({ 'system.additionalresources.-=tracker': null })
      await actor.update({ 'system.additionalresources.tracker': data })

    }
  }

  actor._forceRender()
}

export const fireWeapon = (actor, weapon, shots) => {
  const ammoTracker = getAmmoTracker(actor, weapon)
  ammoTracker.value -= shots
  actor.runOTF(`R:${weapon}`)
  actor._forceRender()
}

const getAmmoTracker = (actor, weaponName) => {
  const trackerName = weaponName + " Ammo"
  const tracker = GURPS.findTracker(actor.system, trackerName)

  return tracker
}

const addTrackerToDataObject = (data, trackerData) => {
  let trackers = getTrackersAsArray(data)
  trackers.push(trackerData)
  return arrayToObject(trackers)
}

const getTrackersAsArray = (data) => {
  let trackerArray = data.additionalresources.tracker
  if (!trackerArray) trackerArray = {}
  return objectToArray(trackerArray)
}

const objectToArray = (object) => {
  return Object.keys(object)
    .sort()
    .map(key => object[key])
}

const arrayToObject = (array, indexLength = 4) => {
  let data = /** @type {{[key: string]: string}} */ ({})
  array.forEach((item, index) => {
    data[zeroFill(index, indexLength)] = item
  })
  return data
}

const zeroFill = (number, width = 5) => {
  width -= number.toString().length
  if (width > 0) {
    return new Array(width + (/\./.test(number.toString()) ? 2 : 1)).join('0') + number
  }
  return number + '' // always return a string
}

const parseShots = (shotsString) => {
  const shotsPart = shotsString.split('(')[0]
  let totalShots = 0
  shotsPart.split('+').forEach(n => totalShots += parseInt(n))
  return totalShots
}
