const axios = require('axios');
const Contestant = require('../models/Contestant');
const Vote = require('../models/Vote');

exports.showVotePage = async (req, res) => {
    try {
        const contestant = await Contestant.findOne({ shareableLink: req.params.link });
        if (!contestant) {
            return res.status(404).send('Contestant not found');
        }
        
        res.render('votes/vote', { 
            contestant,
            paystackKey: process.env.PAYSTACK_PUBLIC_KEY 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.processVote = async (req, res) => {
    try {
        const { contestantId, amount, reference } = req.body;
        
        // Verify payment with Paystack
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        const paymentData = response.data.data;

        if (paymentData.status !== 'success') {
            return res.status(400).json({ error: 'Payment not successful' });
        }

        // Check if vote with this reference already exists
        const existingVote = await Vote.findOne({ transactionReference: reference });
        if (existingVote) {
            return res.status(400).json({ error: 'Duplicate transaction' });
        }

        const amountPaidInNaira = amount / 100 // Convert from kobo to naira
        const numberOfVotes = amountPaidInNaira / 100

        // Create vote record
       
            const vote = new Vote({
                contestant: contestantId,
                amount: amountPaidInNaira, 
                transactionReference: reference,
                status: 'successful'
            });
    
            await vote.save();
        
        

        // Update contestant's vote count
        await Contestant.findByIdAndUpdate(contestantId, { $inc: { voteCount: Number(numberOfVotes) } });

        res.json({ success: true, redirect: `/votes/success/${reference}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.showSuccessPage = async (req, res) => {
    try {
        const vote = await Vote.findOne({ transactionReference: req.params.reference })
            .populate('contestant');
            
        if (!vote) {
            return res.status(404).send('Vote not found');
        }
        
        res.render('votes/success', { vote });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};