import http, { IncomingMessage, ServerResponse } from 'http'
import axios from 'axios';
import { Feed } from 'feed';
import moment from 'moment';




const fetchProposals = (async () => {
    const feed = new Feed({
        title: "Cosmos Proposal",
        id: "Cosmos proposals feed via cosmostaion public api.",
        copyright: "Cosmos gov",
    });
    const url = 'https://api.cosmostation.io/v1/gov/proposals';
    const { data } = await axios.get(url);
    let ooo: GovProposalResponse[] = data as GovProposalResponse[];

    ooo = ooo.sort((a, b) => {
        return (a.proposal_id > b.proposal_id) ? -1 : 1;
    });

    for await (const oo of ooo) {
        if (!oo.proposal_id) continue;
        feed.addItem({
            title: `VotingEnd: ${moment(oo.voting_end_time).toISOString()} **${oo.title}`,
            link: `https://www.mintscan.io/cosmos/proposals/${oo.proposal_id}`,
            date: moment(oo.submit_time).toDate(),
            id: oo.tx_hash,
        });

        // console.dir(`proposal_id:${oo.proposal_id}, date:${oo.voting_end_time}`);
    }
    return feed;
    //    console.dir(ooo);

    interface GovProposalResponse {
        proposal_id: string,
        tx_hash: string,
        proposer: string,
        moniker: string,
        title: string,
        description: string,
        proposal_type: string,
        proposal_status: string,
        submit_time: string,
        deposit_end_time: string,
        voting_start_time: string,
        voting_end_time: string,
    }
});
const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const feed = await fetchProposals();
    res.writeHead(200, { 'Content-Type': 'application/atom+xml' });
    res.end(feed.atom1());
})

server.listen(4000) // 4000番ポートで起動
