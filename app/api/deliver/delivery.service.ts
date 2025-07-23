function calculateDeliveryFee(distance: number): number {
    if (distance <= 50) {
        return 3000;
    } else if (distance <= 60) {
        // Linear increase from 3000 to 3500 over 50-60 km
        return 3000 + (distance - 50) * 50;
    } else if (distance <= 80) {
        // Linear increase from 3500 to 4000 over 60-80 km
        return 3500 + (distance - 60) * 25;
    } else if (distance <= 100) {
        // Linear increase from 4000 to 5000 over 80-100 km
        return 4000 + (distance - 80) * 50;
    } else if (distance <= 110) {
        // Flat fee for 100-110 km
        return 5000;
    } else if (distance <= 120) {
        // Linear increase from 5000 to 5500 over 110-120 km
        return 5000 + (distance - 110) * 50;
    } else if (distance <= 130) {
        // Flat fee for 120-130 km
        return 5500;
    } else if (distance <= 140) {
        // Linear increase from 5500 to 6000 over 130-140 km
        return 5500 + (distance - 130) * 50;
    } else if (distance <= 150) {
        // Flat fee for 140-150 km
        return 6000;
    } else if (distance <= 160) {
        // Linear increase from 6000 to 6500 over 150-160 km
        return 6000 + (distance - 150) * 50;
    } else if (distance <= 170) {
        // Linear increase from 6500 to 7000 over 160-170 km
        return 6500 + (distance - 160) * 50;
    } else if (distance <= 180) {
        // Flat fee for 170-180 km
        return 7000;
    } else if (distance <= 200) {
        // Linear increase from 7000 to 8000 over 180-200 km
        return 7000 + (distance - 180) * 50;
    } else {
        // Beyond 200 km, use a reduced rate of 20/= per km
        return 8000 + (distance - 200) * 20;
    }
}

   