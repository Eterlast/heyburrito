import { expect } from 'chai';
import BurritoStore from '../src/store/BurritoStore';
import { init } from './lib/seedDatabase';

let mongod: any, mongoDriver: any;

describe('Burritostore-test', async () => {

    [
        {
            describe: 'file Driver',
            driver: 'file'
        },
        {
            describe: 'Array Driver',
            driver: 'array'
        },
        {
            describe: 'Mongodb Driver',
            driver: 'mongodb'
        },
    ].forEach((test) => {


        describe(test.describe, async () => {

            async function connectDB(seedDB = false) {
                const dbinit: any = await init({ driver: test.driver, random: false, seedDB });
                if (dbinit.mongod && dbinit.mongoDriver) {
                    mongod = dbinit.mongod
                    mongoDriver = dbinit.mongoDriver
                }
            }

            async function closeDB() {
                if (test.driver === 'mongodb') {
                    if (mongoDriver.client) await mongoDriver.client.close();
                    if (mongod) await mongod.stop();
                }
            }

            before(async () => {
                await connectDB()

            });

            after(async () => {
                await closeDB()
            });


            describe('giveBurrito', async () => {
                it('Should give burrito and return event', async () => {
                    const res1 = await BurritoStore.giveBurrito('USER1', 'USER2');
                    const res2 = await BurritoStore.giveBurrito('USER1', 'USER2');
                    const res3 = await BurritoStore.giveBurrito('USER2', 'USER1');
                    const res4 = await BurritoStore.giveBurrito('USER2', 'USER1');
                    expect(res1).to.equal('USER1');
                    expect(res2).to.equal('USER1');
                    expect(res3).to.equal('USER2');
                    expect(res4).to.equal('USER2');
                });
            });

            describe('takeAwayBurrito', () => {

                it('Should not takeaway burrito, lowset score is 0', async () => {
                    const res = await BurritoStore.takeAwayBurrito('USER3', 'USER1');
                    expect(res).to.deep.equal([]);
                });

                it('Should take away burrito', async () => {
                    const res1 = await BurritoStore.takeAwayBurrito('USER1', 'USER2');
                    const res2 = await BurritoStore.takeAwayBurrito('USER1', 'USER2');
                    const res3 = await BurritoStore.takeAwayBurrito('USER2', 'USER1');
                    const res4 = await BurritoStore.takeAwayBurrito('USER2', 'USER1');
                    expect(res1).to.equal('USER1');
                    expect(res2).to.equal('USER1');
                    expect(res3).to.equal('USER2');
                    expect(res4).to.equal('USER2');
                });
            });

            describe('getUserStats', () => {

                it('Should return userstats for USER1', async () => {
                    const res = await BurritoStore.getUserStats('USER1');
                    expect(res).to.deep.equal({
                        receivedToday: 4,
                        givenToday: 4,
                        _id: 'USER1',
                        received: 4,
                        given: 4
                    });
                });

                it('Should return userstats for USER2', async () => {
                    const res = await BurritoStore.getUserStats('USER2');
                    expect(res).to.deep.equal({
                        receivedToday: 4,
                        givenToday: 4,
                        _id: 'USER2',
                        received: 4,
                        given: 4
                    });
                });

                describe('getScoreBoard', () => {

                    it('Should return scoreboard, listType: to, scoreType: inc', async () => {
                        const res = await BurritoStore.getScoreBoard({ listType: 'to', scoreType: 'inc' });
                        expect(res).to.deep.equal([
                            { _id: 'USER1', score: 2 },
                            { _id: 'USER2', score: 2 }
                        ])
                    });
                    it('Should return scoreboard, listType: to, scoreType: dec', async () => {
                        const res = await BurritoStore.getScoreBoard({ listType: 'to', scoreType: 'dec' });
                        expect(res).to.deep.equal([
                            { _id: 'USER1', score: 2 },
                            { _id: 'USER2', score: 2 }
                        ]);
                    });

                    it('Should return scoreboard, listType: from, scoreType: inc', async () => {
                        const res = await BurritoStore.getScoreBoard({ listType: 'from', scoreType: 'inc' });
                        expect(res).to.deep.equal([
                            { _id: 'USER2', score: 2 },
                            { _id: 'USER1', score: 2 }
                        ]);
                    });

                    it('Should return scoreboard, listType: from, scoreType: dec', async () => {
                        const res = await BurritoStore.getScoreBoard({ listType: 'from', scoreType: 'dec' });
                        expect(res).to.deep.equal([
                            { _id: 'USER2', score: 2 },
                            { _id: 'USER1', score: 2 }
                        ]);
                    });


                    it('Should return scoreboard, user:USER1, listType: to', async () => {
                        const res = await BurritoStore.getUserScoreBoard({ user: 'USER1', listType: 'to' });
                        expect(res).to.deep.equal([
                            { _id: 'USER2', scoreinc: 2, scoredec: 2 },
                        ]);
                    });

                    it('Should return scoreboard, user:USER1, listType: from', async () => {
                        const res = await BurritoStore.getUserScoreBoard({ user: 'USER1', listType: 'from' });
                        expect(res).to.deep.equal([{ _id: 'USER2', scoreinc: 2, scoredec: 2 }]);
                    });

                    it('Should return scoreboard, user:USER2, listType: to', async () => {
                        const res = await BurritoStore.getUserScoreBoard({ user: 'USER2', listType: 'to' });
                        expect(res).to.deep.equal([
                            { _id: 'USER1', scoreinc: 2, scoredec: 2 },
                        ]);
                    });

                    it('Should return scoreboard, user:USER2, listType: from', async () => {
                        const res = await BurritoStore.getUserScoreBoard({ user: 'USER2', listType: 'from' });
                        expect(res).to.deep.equal([{ _id: 'USER1', scoreinc: 2, scoredec: 2 }]);
                    });
                });

                describe('givenBurritosToday', () => {
                    it('Should return givenBurritosToday stats for USER1 lisyType: to', async () => {
                        const res = await BurritoStore.givenBurritosToday('USER1', 'to');
                        expect(res).to.equal(4)
                    });
                    it('Should return givenBurritosToday stats for USER1 lisyType: from', async () => {
                        const res = await BurritoStore.givenBurritosToday('USER1', 'from');
                        expect(res).to.equal(4)
                    });

                    it('Should return givenBurritosToday stats for USER2 lisyType: to', async () => {
                        const res = await BurritoStore.givenBurritosToday('USER2', 'to');
                        expect(res).to.equal(4)
                    });
                    it('Should return givenBurritosToday stats for USER2 lisyType: from', async () => {
                        const res = await BurritoStore.givenBurritosToday('USER2', 'from');
                        expect(res).to.equal(4)
                    });


                });
            })

        });


    });
});
