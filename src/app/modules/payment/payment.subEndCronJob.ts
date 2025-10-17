import cron from 'node-cron';
import { User } from '../user/user.model';

// Create a cron job that runs every day at midnight
cron.schedule('0 0 * * *', async () => {
  // Get the current date
  const currentDate = Date.now();

  // Find users whose subscription has expired
  const expiredSubscriptions = await User.find({
    isSubscription: true,
    subEndDate: { $lt: currentDate } // Subscription expired
  });

  // Loop through each expired subscription and update the user
  for (const user of expiredSubscriptions) {
    user.isSubscription = false;
    user.subEndDate = null; // Clear the subscription end date
    await user.save(); // Save the changes to the user
    console.log(`User ${user._id} subscription has expired.`);
  }

  console.log('Cron job completed. Checked for expired subscriptions.');
});


