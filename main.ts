import http, { IncomingMessage, ServerResponse } from 'http'
import axios from 'axios';
import { Feed } from 'feed';
import moment from 'moment';



const feed = new Feed({
    title: "Cosmos Proposal",
    id: "Cosmos proposals feed via cosmostaion public api.",
    copyright: "Cosmos gov",
});

const fetchProposals = (async () => {
    const url = 'https://api.cosmostation.io/v1/gov/proposals';
    const { data } = await axios.get(url);
    const ooo: GovProposalResponse[] = data as GovProposalResponse[];

    ooo.sort((a, b) => {
        return (a.proposal_id > b.proposal_id) ? -1 : 1;
    });

    for (const oo of ooo) {
        if (!oo.proposal_id) continue;
        feed.addItem({
            title: oo.title,
            link: `https://www.mintscan.io/cosmos/proposals/${oo.proposal_id}`,
            date: moment(oo.voting_end_time).toDate(),
            description: oo.description,
            id: oo.tx_hash,
        });

        // console.dir(`proposal_id:${oo.proposal_id}, date:${oo.voting_end_time}`);
    }


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
    await fetchProposals();
    res.writeHead(200, { 'Content-Type': 'application/atom+xml' });
    res.end(feed.atom1());
})

server.listen(4000) // 4000番ポートで起動
