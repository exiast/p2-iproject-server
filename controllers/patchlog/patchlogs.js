const axios = require("axios");
const patchlogs = require("warframe-patchlogs");
const { Patchnote } = require("../../models");

/**
 *? QUESTION
 *TODO: BELOW
 *  - HOW TO MAKE A HEARTBEAT PROGRAM ?
 *    --||-> logic should be <-||--
 *    - make a timer (1hrs) (-can use cronjob- cron is linux based time app)
 *    - if timer is up
 *    - fetch data axios from patchnotes (reverse it, so the oldest will have smallest ID number)
 *    - count it, how many
 *    - if currentDatabase.length < latestFetch.length
 *    - diffLength = latestFetch.length - currentDatabase.length (to produce number)
 *    - startFrom = latestFetch.length - diffLength
 *    - add all data to database from latestFetch[startFrom] up to latestFetch[latestFetch.length-1]
 *    -
 *
 */
/**
 *! 1. Patchlogs will fetch data from our Patchlogs
 *! 2. make a heartbeat function to hit 3rd API for checking new update
 *
 */
module.exports = class Patchlogs {
	static async showAll(req, res, next) {
		/** FORMAT
    {
      name: 'Beasts of the Sanctuary: Hotfix 22.20.6',
      url: 'https://forums.warframe.com/topic/960140-beasts-of-the-sanctuary-hotfix-22206/',
      date: '2018-05-24T22:00:50Z',
      imgUrl: 'https://i.imgur.com/6ymAONO.jpg',
      description: 'The Orokin Decoration costs/refunds mentioned in Hotfix 22.20.3 are close to being complete. The plan is to cut the Orokin Decoration Oxium costs in half and refund the excess back to the Clan Vault. We are also removing the Orokin Cell costs on the respective Orokin Decorations and refunding those to the Clan Vault as well. Already completed Decorations will not be destroyed when these changes go live. Stay tuned!',
      additions: '',
      changes: '',
      fixes: 'Fixed the game submitting certain types of bug reports immediately instead of saving them for after you quit.\nDisabled some cache-corruption checks that were triggering and preventing updates; we will work on making these automatically repair the cache instead.\nFixed inability to deploy Extractors using Navigation at a Relay.\nFixed a variety of bugs caused by using Transference while going through Sanctuary Onslaught Conduit (namely not being able to do anything or use Transference while controlling Operator).\nFixed Dojo Pigment ‘Contribute’ button being automatically selected when the contribute screen appears when using a controller.\nFixed no on-screen keyboard appearing when changing Dojo room message when using a controller. \nFixed script error when displaying mission countdown in Ukrainian.\nFixed a script error related to Articulas.',
      type: 'Hotfix'
    }
     */
		try {
			// res.status(200).json({ length: patchlogs.posts.length, data: patchlogs.posts });
			const dataRead = await Patchnote.findAll({ attributes: { exclude: ["createdAt", ["updatedAt"]] } });
			res.status(200).json({ response: dataRead.reverse() });
		} catch (error) {
			next(error);
		}
	}

	static async fetchPatchnoteLength(req, res, next) {
		try {
			// - fetch data axios from patchnotes (reverse it, so the oldest will have smallest ID number)
			const latestPatchlogs = patchlogs.posts;
			// - count it, how many
			const currentPatchnoteDatabase = await Patchnote.findAndCountAll();
			// - if currentDatabase.length < latestPatchlogs.length
			if (currentPatchnoteDatabase.count < latestPatchlogs.length) {
				// - diffLength = latestPatchlogs.length - currentPatchnoteDatabase.length (to produce number)
				let diffLength = Math.abs(latestPatchlogs.length - currentPatchnoteDatabase.count),
					//
					startFrom = latestPatchlogs.length - diffLength,
					//
					strippedPatchlogs = latestPatchlogs.reverse().filter((data, index) => {
						if (index >= startFrom) {
							return data;
						}
					});

				//add data strippedPatchLogs to database
				console.log(...strippedPatchlogs);
				strippedPatchlogs.forEach(data => {
					Patchnote.create({ ...data })
						.then(data => console.log(data.dataValues))
						.catch(error => console.log(error));
				});

				console.log({
					length: { current: currentPatchnoteDatabase.count, latest: latestPatchlogs.length },
					response: strippedPatchlogs,
				});
				return;
			}
			console.log({ message: "there is no update" });
		} catch (error) {
			next(error);
		}
	}
};
