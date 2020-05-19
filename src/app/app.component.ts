import { Component } from '@angular/core';
import { PlayerService } from './services/player.service';
import { TeamService } from './services/team.service';
import { Team } from './model/models';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	window = "tournament";

	newTournament = {
		visible: true,
		format: {
			formats: ["Bracket"],
			selected: "Bracket"
		},
		name: "",
		playersPerTeam: 3,
		bestOf: 3,
		bracket: {
			lossesToElim: 2,
			groups: 1
		},
		complete: () => {
			let info = this.newTournament;
			let complete = info.name.length > 0;
			complete = complete && info.playersPerTeam >= 1 && info.playersPerTeam <= 4;
			complete = complete && info.bestOf % 2 == 1 && info.bestOf >= 1 && info.bestOf <= 9;
			if (this.newTournament.format.selected == "Bracket") {
				complete = complete && info.bracket.lossesToElim >= 1 && info.bracket.lossesToElim <= 3;
				complete = complete && info.bracket.groups >= 1 && info.bracket.groups <= 9;
			}
			return complete;
		}
	};

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
		private fs: AngularFirestore,
		public player: PlayerService,
		public team: TeamService
	) { }

	public createTeam() {
		let teamName = prompt("Please enter the team name:");
		if (teamName != null && teamName != "") {
			this.player.teams.createTeam(teamName);
		}
	}

	public selectTeam(id: string, team: Team) {
		this.sidebarInfo.teams.selected = team;
		this.team.select(this.fs.collection("teams").doc(id).ref, team);
	}

	public deleteTeam() {
		if (confirm("Are you sure you want to delete " + this.team.name + "?")) {
			this.team.removeTeam()
				.then(_ => {
					this.sidebarInfo.teams.selected = null;
					this.team.select(null, {name: null, captain: null});
				})
				.catch(err => 
					alert(err)
				);
		}
	}

	public leaveTeam() {
		if (confirm("Are you sure you want to leave " + this.team.name + "?")) {
			this.player.leaveTeam(this.team.teamRef)
				.then(_ => {
					this.sidebarInfo.teams.selected = null;
					this.team.select(null, {name: null, captain: null});
				})
		}
	}

	public addPlayer() {
		let email = prompt("Enter the email address of the new teammate:");
		if (email) this.team.invitePlayer(email).catch(alert);
	}

	public signOut() {
		this.player.signOut();
		this.resetAll();
	}

	public resetAll() {
		this.sidebarInfo.tournaments.selected = null;
		this.sidebarInfo.teams.selected = null;
	}

}
