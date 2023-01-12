import http, { IncomingMessage, ServerResponse } from 'http'
import axios from 'axios';
import { Feed } from 'feed';

const propsEndpoint = 'https://api.cosmoscan.net/proposals';

const fetchProposals = (async () => {
    const feed = new Feed({
        title: "Cosmos Proposal",
        id: "Cosmos proposals feed via cosmoscan api.",
        copyright: "Cosmos gov",
    });
    const { data } = await axios.get(propsEndpoint);
    let ooo: GovProposalResponse[] = data as GovProposalResponse[];

    ooo = ooo.sort((a, b) => {
        return (a.id > b.id) ? -1 : 1;
    });

    for await (const oo of ooo) {
        if (!oo.id) continue;
        feed.addItem({
            title: `VotingEnd: ${new Date(Number(oo.voting_end_time) * 1000).toISOString()} **${oo.title}`,
            link: `https://www.mintscan.io/cosmos/proposals/${oo.id}`,
            date: new Date(Number(oo.submit_time) * 1000),
            id: oo.tx_hash,
        });

        // console.dir(`proposal_id:${oo.proposal_id}, date:${oo.voting_end_time}`);
    }
    return feed;
    //    console.dir(ooo);

    interface GovProposalResponse {
        id: string,
        tx_hash: string,
        type: string,
        proposer: string,
        proposer_address: string,
        title: string,
        description: string,
        status: string,
        votes_yes: string,
        votes_abstain: string,
        votes_no: string,
        votes_no_with_veto: string,
        submit_time: Date,
        deposit_end_time: Date,
        total_deposits: string,
        voting_start_time: Date,
        voting_end_time: Date,
        voters: number,
        participation_rate: string,
        turnout: string,
        activity: boolean
    }
});
const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const feed = await fetchProposals();
    res.writeHead(200, { 'Content-Type': 'application/atom+xml' });
    res.end(feed.atom1());
})

server.listen(4000) // 4000番ポートで起動
