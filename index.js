
module.exports = function autoWarrior(dispatch) {

	const bladeDraw_KEY = 0;

	let cid;
	let model;
	let player;
	let enabled = false;
	let lastSkill;
	let failsafe = 0;
	let edgeStacks = 0;
	let tcCheck = false;

	const BROOCH_KEY = "z";

	const robot = require("robotjs");
	const command = dispatch.command;

	const DG = 200200;
	const traverseCut = 281000;
	const tracerseCut_abnormality = 101300;
	const chargingSlash = 161001;
	const risingFury2 = 191101;
    const vortexSlash = 170701;
    const bladeWaltz = 400110;
    const bladeWaltz_tank = 400120;
	

	command.add('aw', {
		$none() {
			enabled = !enabled;
			command.message(`auto-warrior : ${enabled ? "enabled" : "disabled"}.`);
		}
	});

	dispatch.hook('C_START_SKILL', 7, (event) => {
		if (!enabled) { return };
		lastSkill = event.skill.id;
		if (event.skill.id == DG) {
			robot.keyTap(BROOCH_KEY);
		}
		if (event.skill.id == traverseCut) {
			tcCheck = true;
			setTimeout(function(){ tcCheck = false; },	35500);
		}
		if (event.skill.id === risingFury2 || event.skill.id === vortexSlash || event.skill.id === chargingSlash) {
			repeater2(bladeDraw_KEY, event.skill.id);
			failsafe = 0;
		}
		if ((event.skill.id === bladeWaltz || event.skill.id === bladeWaltz_tank) && edgeStacks<9 && tcCheck === true) {
			repeater2(bladeDraw_KEY, event.skill.id);
			failsafe = 0;
		}
	});
	
	dispatch.hook('S_ABNORMALITY_REFRESH', 1, (event) => {
		if (!enabled) { return };
		if (event.id === tracerseCut_abnormality && event.target === cid && event.stacks === 13 && lastSkill === traverseCut) {
			repeater(bladeDraw_KEY, traverseCut)
			failsafe = 0;
		}
	})

	dispatch.hook('S_ABNORMALITY_END', 1, (event) =>{
		if (!enabled) { return };
		if (event.id === tracerseCut_abnormality && event.target === cid) {
			tcCheck = false;
		}
	})

	dispatch.hook('S_LOGIN', dispatch.majorPatchVersion >= 81 ? 15 : 14, (event) => {
		cid = event.gameId;
		player = event.name;
		model = event.templateId;
		//enabled = (model - 10101) % 100 === 0;
	});

	dispatch.hook('S_PLAYER_STAT_UPDATE', 17, (event) => {
        edgeStacks = event.edge;
    });

	function repeater(key, trigger) {
		if (lastSkill == trigger && failsafe < 30) {
			failsafe++;
			robot.keyTap(key);
			setTimeout(function (key, trigger) { repeater(key, trigger); }, 70, key, trigger);
		}
	}

	function repeater2(key, trigger) {
		if (lastSkill == trigger && failsafe < 100) {
			failsafe++;
			robot.keyTap(key);
			setTimeout(function (key, trigger) { repeater(key, trigger); }, 70, key, trigger);
		}
	}
}