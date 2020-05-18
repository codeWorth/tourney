import { Component } from '@angular/core';
import { PlayerService } from './services/player.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	window = "tournament";

	standingsInfo = {
		"tournaments/tourneyA": [ // ref.path of sidebarInfo.selected
			{
				name: "Group 1",
				teams: {
					"abcxyz": { // ref.id of <Team>
						name: "UCLA",
						record: {
							gameWins: 10,
							gameLosses: 6,
							seriesWins: 3,
							seriesLosses: 1
						}
					},
					"hjhksk": {
						name: "USC",
						record: {
							gameWins: 6,
							gameLosses: 0,
							seriesWins: 2,
							seriesLosses: 0
						}
					}
				}
			},
			{
				name: "Group 2",
				teams: {
					"abcxyz": {
						name: "UCI",
						record: {
							gameWins: 11,
							gameLosses: 6,
							seriesWins: 3,
							seriesLosses: 1
						}
					},
					"hjhksk": {
						name: "UCSC",
						record: {
							gameWins: 5,
							gameLosses: 3,
							seriesWins: 1,
							seriesLosses: 1
						}
					}
				}
			}
		]
	};

	sidebarInfo = {
		tournaments: {
			upcoming: [ // DocumentSnapshot[]
				{ data: { name: "tourneyA", format: "bracket" }, ref: { path: "tournaments/tourneyA" } },
				{ data: { name: "tourneyC", format: "bracket" }, ref: { path: "tournaments/tourneyC" } },
				{ data: { name: "tourneyF", format: "bracket" }, ref: { path: "tournaments/tourneyF" } }
			],
			past: [
				{ data: { name: "tourneyB", format: "bracket" }, ref: { path: "tournaments/tourneyB" } },
				{ data: { name: "tourneyD", format: "bracket" }, ref: { path: "tournaments/tourneyD" } },
				{ data: { name: "tourneyE", format: "bracket" }, ref: { path: "tournaments/tourneyE" } }
			],
			selected: null
		},
		teams: {
			selected: null
		}
	};

	userDetailInfo = {
		changed: false
	}

	constructor(
		public player: PlayerService,
	) { }

	public createTeam() {
		let teamName = prompt("Please enter the team name:");
		if (teamName != null && teamName != "") {
			this.player.teams.createTeam(teamName);
		}
	}
}
