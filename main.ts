import http, { IncomingMessage, ServerResponse } from 'http'
import axios from 'axios';
import { Feed } from 'feed';

const propsEndpoint = 'https://lcd-osmosis.keplr.app/cosmos/gov/v1beta1/proposals?proposal_status=0&pagination.limit=10&pagination.offset=0&pagination.reverse=true';

const fetchProposals = (async () => {
    const feed = new Feed({
        title: "Cosmos Proposal",
        id: "Cosmos proposals feed via cosmoscan api.",
        copyright: "Cosmos gov",
    });
    const { data } = await axios.get(propsEndpoint);
    let ooo: KeplrGovProposalResponse[] = await data.proposals as KeplrGovProposalResponse[];
    console.dir(ooo);
    ooo = ooo.sort((a, b) => {
        return (a.proposal_id > b.proposal_id) ? -1 : 1;
    });

    for await (const oo of ooo) {
        if (!oo.proposal_id) continue;
        console.dir(oo.voting_end_time);
        feed.addItem({
            title: `VotingEnd: ${new Date(oo.voting_end_time).toISOString()} **${oo.content.title}`,
            link: `https://www.mintscan.io/cosmos/proposals/${oo.proposal_id}`,
            date: new Date(oo.submit_time),
            id: oo.proposal_id,
        });
    }
    return feed;

    interface KeplrGovProposalResponse {
        content: {
            '@type': string,
            description: string,
            title: string
        },
        deposit_end_time: Date,
        final_tally_result: {},
        is_expedited: boolean,
        proposal_id: string,
        status: string,
        submit_time: string,
        total_deposit: {},
        voting_end_time: string,
        voting_start_time: Date
    }
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


// const feed = fetchProposals().then((f) => {
//     f.atom1();
// });
