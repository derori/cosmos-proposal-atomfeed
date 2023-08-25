import http, { IncomingMessage, ServerResponse } from 'http'
import axios from 'axios';
import { Feed } from 'feed';

const propsEndpoint = process.env.PROPS_ENDPOINT || '';
const chainName = process.env.CHAIN_NAME || 'Undefined as dotenv';
const locationBaseUrl = process.env.LINK_BASE_URL;

const fetchProposals = (async () => {
    const feed = new Feed({
        title: `${chainName} Proposals`,
        id: `${chainName} proposals feed via mynode api.`,
        copyright: `${chainName} gov`,
    });
    const { data } = await axios.get(propsEndpoint);
    let ooo: GovProposalResponse[] = await data.proposals as GovProposalResponse[];

    for await (const oo of ooo) {
        if (!oo.proposal_id) continue;
        console.dir(oo.voting_end_time);
        feed.addItem({
            title: `VotingEnd: ${new Date(oo.voting_end_time).toISOString()} **${oo.content.title}`,
            link: `${locationBaseUrl}${oo.proposal_id}`,
            date: new Date(oo.submit_time),
            id: oo.proposal_id,
        });
    }

    return feed;

    interface GovProposalResponse {
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
